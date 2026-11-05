package application

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	cataloguedomain "github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/catalogue/domain"
	marketdomain "github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/market/domain"
	"github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/marketflow"
)

var (
	ErrDependencyMissing     = errors.New("application dependency missing")
	ErrVersionConflict       = errors.New("application version conflict")
	ErrIdempotencyConflict   = errors.New("idempotency key conflict")
	ErrNoCrossingOrders      = errors.New("no crossing orders")
	ErrNotSettlementReady    = errors.New("trade is not ready for settlement")
	ErrInvalidPolicyGraph    = errors.New("invalid execution policy dependency graph")
	ErrInvalidTradeDimension = errors.New("invalid trade status dimension")
)

type MarketCatalogueGuard struct {
	Markets    MarketReader
	Categories CategoryReader
	Mappings   CategoryMappingReader
}

func (g MarketCatalogueGuard) ValidateOffer(ctx context.Context, offer marketflow.Offer) error {
	if g.Markets == nil || g.Categories == nil || g.Mappings == nil {
		return ErrDependencyMissing
	}

	market, err := g.Markets.GetMarket(ctx, marketdomain.MarketID(offer.MarketID))
	if err != nil {
		return err
	}
	if market == nil || !market.IsOperational() {
		return marketflow.ErrNotEligible
	}

	publicCategory, err := g.Categories.GetCategory(
		ctx,
		cataloguedomain.CategoryID(offer.PublicCategoryID),
	)
	if err != nil {
		return err
	}

	specializedCategory, err := g.Categories.GetCategory(
		ctx,
		cataloguedomain.CategoryID(offer.SpecializedCategoryID),
	)
	if err != nil {
		return err
	}

	if publicCategory == nil ||
		specializedCategory == nil ||
		!publicCategory.IsSelectable() ||
		!specializedCategory.IsSelectable() ||
		publicCategory.Kind() != cataloguedomain.CategoryKindGeneral ||
		specializedCategory.Kind() != cataloguedomain.CategoryKindSpecialized {
		return marketflow.ErrNotEligible
	}

	mapping, err := g.Mappings.GetMapping(
		ctx,
		marketdomain.MarketID(offer.MarketID),
		cataloguedomain.CategoryID(offer.PublicCategoryID),
		cataloguedomain.CategoryID(offer.SpecializedCategoryID),
	)
	if err != nil {
		return err
	}

	if mapping == nil || !mapping.IsUsable() {
		return marketflow.ErrNotEligible
	}

	return nil
}

type OfferReadiness interface {
	ValidateOffer(context.Context, marketflow.Offer) error
}

type CompositeOfferReadiness struct {
	Catalogue MarketCatalogueGuard
	Business  OfferBusinessValidator
}

func (v CompositeOfferReadiness) ValidateOffer(
	ctx context.Context,
	offer marketflow.Offer,
) error {
	if v.Business == nil {
		return ErrDependencyMissing
	}
	if err := v.Catalogue.ValidateOffer(ctx, offer); err != nil {
		return err
	}
	return v.Business.ValidateConfigurationAndEligibility(ctx, offer)
}

type OfferCommand struct {
	ActorID         marketflow.ID
	OfferID         marketflow.ID
	ExpectedVersion uint64
	CorrelationID   marketflow.ID
}

type OfferLifecycleService struct {
	Transactions TransactionManager
	Offers       marketflow.OfferRepository
	Identity     marketflow.IdentityGateway
	Readiness    OfferReadiness
	Audit        marketflow.AuditRepository
	IDs          IDGenerator
	Clock        Clock
}

func (s *OfferLifecycleService) SubmitForReview(ctx context.Context, cmd OfferCommand) (marketflow.Offer, error) {
	return s.transition(ctx, cmd, "offers.submit", "submit_for_review")
}

func (s *OfferLifecycleService) Approve(ctx context.Context, cmd OfferCommand) (marketflow.Offer, error) {
	return s.transition(ctx, cmd, "offers.approve", "approve")
}

func (s *OfferLifecycleService) Publish(ctx context.Context, cmd OfferCommand) (marketflow.Offer, error) {
	return s.transition(ctx, cmd, "offers.publish", "publish")
}

func (s *OfferLifecycleService) transition(
	ctx context.Context,
	cmd OfferCommand,
	permission string,
	action string,
) (marketflow.Offer, error) {
	if s == nil || s.Transactions == nil || s.Offers == nil ||
		s.Identity == nil || s.Readiness == nil ||
		s.Audit == nil || s.IDs == nil || s.Clock == nil {
		return marketflow.Offer{}, ErrDependencyMissing
	}
	if strings.TrimSpace(string(cmd.ActorID)) == "" ||
		strings.TrimSpace(string(cmd.OfferID)) == "" ||
		strings.TrimSpace(string(cmd.CorrelationID)) == "" ||
		cmd.ExpectedVersion == 0 {
		return marketflow.Offer{}, marketflow.ErrInvalidInput
	}

	if err := s.Identity.VerifyIdentity(ctx, cmd.ActorID); err != nil {
		return marketflow.Offer{}, err
	}
	if err := s.Identity.Authorize(ctx, cmd.ActorID, permission); err != nil {
		return marketflow.Offer{}, err
	}

	var result marketflow.Offer

	err := s.Transactions.WithinTransaction(ctx, func(txctx context.Context) error {
		offer, err := s.Offers.GetOffer(txctx, cmd.OfferID)
		if err != nil {
			return err
		}
		if offer.Version != cmd.ExpectedVersion {
			return ErrVersionConflict
		}

		previousVersion := offer.Version
		now := s.Clock.Now().UTC()

		switch action {
		case "submit_for_review":
			if err := s.Readiness.ValidateOffer(txctx, offer); err != nil {
				return err
			}
			err = offer.SubmitForReview(now)
		case "approve":
			err = offer.Approve(now)
		case "publish":
			if err := s.Readiness.ValidateOffer(txctx, offer); err != nil {
				return err
			}
			err = offer.Publish(now)
		default:
			return marketflow.ErrInvalidInput
		}
		if err != nil {
			return err
		}

		if err := s.Offers.SaveOffer(txctx, offer, previousVersion); err != nil {
			return err
		}

		eventID, err := s.IDs.NewID(txctx, "audit")
		if err != nil {
			return err
		}

		event := marketflow.AuditEvent{
			ID:              eventID,
			AggregateType:   "offer",
			AggregateID:     offer.ID,
			Action:          action,
			ActorID:         cmd.ActorID,
			CorrelationID:   cmd.CorrelationID,
			PreviousVersion: previousVersion,
			NewVersion:      offer.Version,
			OccurredAt:      now,
		}
		if err := s.Audit.Append(txctx, event); err != nil {
			return err
		}

		result = offer
		return nil
	})

	return result, err
}

// Supply request selection.

type SelectProposalCommand struct {
	ActorID         marketflow.ID
	RequestID       marketflow.ID
	ProposalID      marketflow.ID
	ExpectedVersion uint64
	CorrelationID   marketflow.ID
}

type SupplyRequestService struct {
	Transactions TransactionManager
	Requests     SupplyRequestCommandRepository
	Proposals    ProposalCommandRepository
	Validator    ProposalValidator
	Identity     marketflow.IdentityGateway
	Audit        marketflow.AuditRepository
	IDs          IDGenerator
	Clock        Clock
}

func (s *SupplyRequestService) SelectProposal(
	ctx context.Context,
	cmd SelectProposalCommand,
) (marketflow.SupplyRequest, error) {
	if s == nil || s.Transactions == nil || s.Requests == nil ||
		s.Proposals == nil || s.Validator == nil || s.Identity == nil ||
		s.Audit == nil || s.IDs == nil || s.Clock == nil {
		return marketflow.SupplyRequest{}, ErrDependencyMissing
	}
	if cmd.ExpectedVersion == 0 ||
		strings.TrimSpace(string(cmd.ActorID)) == "" ||
		strings.TrimSpace(string(cmd.RequestID)) == "" ||
		strings.TrimSpace(string(cmd.ProposalID)) == "" ||
		strings.TrimSpace(string(cmd.CorrelationID)) == "" {
		return marketflow.SupplyRequest{}, marketflow.ErrInvalidInput
	}

	if err := s.Identity.VerifyIdentity(ctx, cmd.ActorID); err != nil {
		return marketflow.SupplyRequest{}, err
	}
	if err := s.Identity.Authorize(ctx, cmd.ActorID, "supply_requests.select_proposal"); err != nil {
		return marketflow.SupplyRequest{}, err
	}

	var result marketflow.SupplyRequest

	err := s.Transactions.WithinTransaction(ctx, func(txctx context.Context) error {
		request, requestRevision, err := s.Requests.GetForUpdate(txctx, cmd.RequestID)
		if err != nil {
			return err
		}
		if requestRevision != cmd.ExpectedVersion {
			return ErrVersionConflict
		}

		proposal, proposalRevision, err := s.Proposals.GetForUpdate(txctx, cmd.ProposalID)
		if err != nil {
			return err
		}

		if err := s.Validator.ValidateProposal(txctx, request, proposal); err != nil {
			return err
		}
		if err := marketflow.SelectProposal(&request, proposal); err != nil {
			return err
		}

		proposal.State = marketflow.ProposalAccepted

		if err := s.Proposals.Save(txctx, proposal, proposalRevision); err != nil {
			return err
		}
		if err := s.Requests.Save(txctx, request, requestRevision); err != nil {
			return err
		}

		eventID, err := s.IDs.NewID(txctx, "audit")
		if err != nil {
			return err
		}

		if err := s.Audit.Append(txctx, marketflow.AuditEvent{
			ID:              eventID,
			AggregateType:   "supply_request",
			AggregateID:     request.ID,
			Action:          "proposal_selected",
			ActorID:         cmd.ActorID,
			CorrelationID:   cmd.CorrelationID,
			PreviousVersion: requestRevision,
			NewVersion:      requestRevision + 1,
			OccurredAt:      s.Clock.Now().UTC(),
			Metadata: map[string]string{
				"proposal_id": string(proposal.ID),
			},
		}); err != nil {
			return err
		}

		result = request
		return nil
	})

	return result, err
}

// Order admission and resource reservation.

type PlaceOrderCommand struct {
	ActorID        marketflow.ID
	Order          marketflow.Order
	IdempotencyKey string
	CorrelationID  marketflow.ID
}

type OrderAdmissionService struct {
	Transactions TransactionManager
	Orders       OrderCommandRepository
	Validator    OrderAdmissionValidator
	Resources    OrderResourceGateway
	Identity     marketflow.IdentityGateway
	Audit        marketflow.AuditRepository
	IDs          IDGenerator
	Clock        Clock
}

func CalculateOrderNotional(order marketflow.Order) (int64, error) {
	if order.Side != marketflow.Buy {
		return 0, nil
	}
	if order.Price <= 0 || order.Quantity <= 0 {
		return 0, marketflow.ErrInvalidInput
	}
	if order.Price > math.MaxInt64/order.Quantity {
		return 0, marketflow.ErrInvalidInput
	}
	return order.Price * order.Quantity, nil
}

func sameOrderIntent(a, b marketflow.Order) bool {
	return a.ID == b.ID &&
		a.OfferID == b.OfferID &&
		a.MarketID == b.MarketID &&
		a.UserID == b.UserID &&
		a.Side == b.Side &&
		a.Price == b.Price &&
		a.Quantity == b.Quantity &&
		a.CreatedAt.Equal(b.CreatedAt)
}

func (s *OrderAdmissionService) Place(
	ctx context.Context,
	cmd PlaceOrderCommand,
) (marketflow.Order, error) {
	if s == nil || s.Transactions == nil || s.Orders == nil ||
		s.Validator == nil || s.Resources == nil ||
		s.Identity == nil || s.Audit == nil ||
		s.IDs == nil || s.Clock == nil {
		return marketflow.Order{}, ErrDependencyMissing
	}

	key := strings.TrimSpace(cmd.IdempotencyKey)
	if key == "" || len(key) > 200 ||
		strings.TrimSpace(string(cmd.ActorID)) == "" ||
		strings.TrimSpace(string(cmd.CorrelationID)) == "" {
		return marketflow.Order{}, marketflow.ErrInvalidInput
	}

	order := cmd.Order
	if err := order.Validate(); err != nil {
		return marketflow.Order{}, err
	}
	if order.UserID != cmd.ActorID || order.State != marketflow.OrderPending {
		return marketflow.Order{}, marketflow.ErrNotEligible
	}

	if err := s.Identity.VerifyIdentity(ctx, cmd.ActorID); err != nil {
		return marketflow.Order{}, err
	}
	if err := s.Identity.Authorize(ctx, cmd.ActorID, "orders.place"); err != nil {
		return marketflow.Order{}, err
	}
	if err := s.Validator.ValidateOrder(ctx, order); err != nil {
		return marketflow.Order{}, err
	}

	// Fast idempotency check avoids repeating an external reservation.
	existing, found, err := s.Orders.GetByIdempotencyKey(ctx, key)
	if err != nil {
		return marketflow.Order{}, err
	}
	if found {
		if !sameOrderIntent(existing, order) {
			return marketflow.Order{}, ErrIdempotencyConflict
		}
		return existing, nil
	}

	notional, err := CalculateOrderNotional(order)
	if err != nil {
		return marketflow.Order{}, err
	}

	reservationID, err := s.Resources.ReserveForOrder(ctx, order, notional, key)
	if err != nil {
		return marketflow.Order{}, err
	}
	if strings.TrimSpace(string(reservationID)) == "" {
		return marketflow.Order{}, marketflow.ErrInvalidInput
	}

	var result marketflow.Order
	replayed := false

	txErr := s.Transactions.WithinTransaction(ctx, func(txctx context.Context) error {
		current, exists, err := s.Orders.GetByIdempotencyKey(txctx, key)
		if err != nil {
			return err
		}
		if exists {
			if !sameOrderIntent(current, order) {
				return ErrIdempotencyConflict
			}
			replayed = true
			result = current
			return nil
		}

		orderToSave := order
		if err := orderToSave.Open(); err != nil {
			return err
		}

		created, err := s.Orders.CreateOrder(
			txctx,
			orderToSave,
			key,
			reservationID,
		)
		if err != nil {
			return err
		}

		eventID, err := s.IDs.NewID(txctx, "audit")
		if err != nil {
			return err
		}

		if err := s.Audit.Append(txctx, marketflow.AuditEvent{
			ID:              eventID,
			AggregateType:   "order",
			AggregateID:     created.ID,
			Action:          "placed",
			ActorID:         cmd.ActorID,
			CorrelationID:   cmd.CorrelationID,
			PreviousVersion: order.Version,
			NewVersion:      created.Version,
			OccurredAt:      s.Clock.Now().UTC(),
			Metadata: map[string]string{
				"reservation_id":  string(reservationID),
				"idempotency_key": key,
			},
		}); err != nil {
			return err
		}

		result = created
		return nil
	})

	if txErr != nil && !replayed {
		releaseErr := s.Resources.ReleaseOrderResources(
			ctx,
			reservationID,
			key,
		)
		if releaseErr != nil {
			return marketflow.Order{}, errors.Join(
				txErr,
				fmt.Errorf("reservation compensation failed: %w", releaseErr),
			)
		}
		return marketflow.Order{}, txErr
	}

	return result, txErr
}

// Matching is performed only inside a transaction that locks both orders.
// MatchOrders mutates local copies; those copies are persisted atomically here.

type MatchingService struct {
	Transactions TransactionManager
	Book         OrderBookCommandRepository
	IDs          IDGenerator
	Clock        Clock
}

func (s *MatchingService) MatchNext(
	ctx context.Context,
	marketID marketflow.ID,
	offerID marketflow.ID,
) (MatchRecord, error) {
	if s == nil || s.Transactions == nil || s.Book == nil ||
		s.IDs == nil || s.Clock == nil {
		return MatchRecord{}, ErrDependencyMissing
	}
	if strings.TrimSpace(string(marketID)) == "" ||
		strings.TrimSpace(string(offerID)) == "" {
		return MatchRecord{}, marketflow.ErrInvalidInput
	}

	var result MatchRecord

	err := s.Transactions.WithinTransaction(ctx, func(txctx context.Context) error {
		buy, sell, err := s.Book.LockBestCrossingPair(txctx, marketID, offerID)
		if err != nil {
			return err
		}

		originalBuyVersion := buy.Version
		originalSellVersion := sell.Version

		match, err := marketflow.MatchOrders(&buy, &sell)
		if err != nil {
			return err
		}

		matchID, err := s.IDs.NewID(txctx, "match")
		if err != nil {
			return err
		}

		now := s.Clock.Now().UTC()

		record := MatchRecord{
			ID:          matchID,
			MarketID:    buy.MarketID,
			OfferID:     buy.OfferID,
			BuyOrderID:  match.BuyOrderID,
			SellOrderID: match.SellOrderID,
			BuyerID:     buy.UserID,
			SellerID:    sell.UserID,
			Quantity:    match.Quantity,
			Price:       match.Price,
			CreatedAt:   now,
		}

		if err := s.Book.SaveOrder(txctx, buy, originalBuyVersion); err != nil {
			return err
		}
		if err := s.Book.SaveOrder(txctx, sell, originalSellVersion); err != nil {
			return err
		}
		if err := s.Book.SaveMatch(txctx, record, "match:"+string(matchID)); err != nil {
			return err
		}

		result = record
		return nil
	})

	if errors.Is(err, ErrNoCrossingOrders) {
		return MatchRecord{}, ErrNoCrossingOrders
	}
	return result, err
}

// Trade state dimensions are updated independently.
// An external contract/service/delivery response must be verified before
// the corresponding status update is submitted.

type TradeDimension string

const (
	DimensionContract TradeDimension = "contract"
	DimensionServices TradeDimension = "services"
	DimensionDelivery TradeDimension = "delivery"
)

type TradeStatusCommand struct {
	TradeID         marketflow.ID
	ExpectedVersion uint64
	Dimension       TradeDimension
	Value           string
}

type TradeWorkflowService struct {
	Transactions TransactionManager
	Trades       TradeCommandRepository
	Clock        Clock
}

func (s *TradeWorkflowService) UpdateStatus(
	ctx context.Context,
	cmd TradeStatusCommand,
) (marketflow.Trade, error) {
	if s == nil || s.Transactions == nil || s.Trades == nil || s.Clock == nil {
		return marketflow.Trade{}, ErrDependencyMissing
	}
	if cmd.ExpectedVersion == 0 || strings.TrimSpace(string(cmd.TradeID)) == "" {
		return marketflow.Trade{}, marketflow.ErrInvalidInput
	}

	var result marketflow.Trade

	err := s.Transactions.WithinTransaction(ctx, func(txctx context.Context) error {
		trade, err := s.Trades.GetForUpdate(txctx, cmd.TradeID)
		if err != nil {
			return err
		}
		if trade.Version != cmd.ExpectedVersion {
			return ErrVersionConflict
		}

		switch cmd.Dimension {
		case DimensionContract:
			value := marketflow.ContractState(cmd.Value)
			switch value {
			case marketflow.ContractPending,
				marketflow.ContractCreated,
				marketflow.ContractFailed,
				marketflow.ContractNotRequired:
				trade.Contract = value
			default:
				return ErrInvalidTradeDimension
			}

		case DimensionServices:
			value := marketflow.ServiceState(cmd.Value)
			switch value {
			case marketflow.ServicePending,
				marketflow.ServiceInProgress,
				marketflow.ServiceCompleted,
				marketflow.ServiceFailed,
				marketflow.ServiceNotRequired:
				trade.Services = value
			default:
				return ErrInvalidTradeDimension
			}

		case DimensionDelivery:
			value := marketflow.DeliveryState(cmd.Value)
			switch value {
			case marketflow.DeliveryPending,
				marketflow.DeliveryConfirmed,
				marketflow.DeliveryFailed,
				marketflow.DeliveryNotRequired:
				trade.Delivery = value
			default:
				return ErrInvalidTradeDimension
			}

		default:
			return ErrInvalidTradeDimension
		}

		trade.RecalculateSettlementReadiness()
		trade.Version++
		trade.UpdatedAt = s.Clock.Now().UTC()

		if err := trade.Validate(); err != nil {
			return err
		}
		if err := s.Trades.Save(txctx, trade, cmd.ExpectedVersion); err != nil {
			return err
		}

		result = trade
		return nil
	})

	return result, err
}

func RequireSettlementReadiness(trade marketflow.Trade) error {
	if err := trade.Validate(); err != nil {
		return err
	}
	trade.RecalculateSettlementReadiness()
	if trade.SettlementReadiness != marketflow.SettlementReady {
		return ErrNotSettlementReady
	}
	return nil
}

// Execution policy validation includes cycle detection and ordering checks.

func ValidateExecutionPolicy(policy marketflow.ExecutionPolicy) error {
	if err := policy.Validate(); err != nil {
		return err
	}

	steps := make(map[string]marketflow.ExecutionStep, len(policy.Steps))
	orders := make(map[int]bool, len(policy.Steps))

	for _, step := range policy.Steps {
		if orders[step.Order] {
			return ErrInvalidPolicyGraph
		}
		orders[step.Order] = true
		steps[step.Code] = step
	}

	state := make(map[string]uint8, len(steps))

	var visit func(string) error
	visit = func(code string) error {
		switch state[code] {
		case 1:
			return ErrInvalidPolicyGraph
		case 2:
			return nil
		}

		step, exists := steps[code]
		if !exists {
			return ErrInvalidPolicyGraph
		}

		state[code] = 1

		for _, dependency := range step.DependsOn {
			dependencyStep, exists := steps[dependency]
			if !exists || dependencyStep.Order >= step.Order {
				return ErrInvalidPolicyGraph
			}
			if err := visit(dependency); err != nil {
				return err
			}
		}

		state[code] = 2
		return nil
	}

	for code := range steps {
		if err := visit(code); err != nil {
			return err
		}
	}

	return nil
}

type CompleteExecutionStepCommand struct {
	TradeID          marketflow.ID
	StepCode         string
	ExpectedRevision uint64
}

type ExecutionProgressService struct {
	Transactions TransactionManager
	Progress     ExecutionProgressCommandRepository
}

func (s *ExecutionProgressService) CompleteStep(
	ctx context.Context,
	policy marketflow.ExecutionPolicy,
	cmd CompleteExecutionStepCommand,
) error {
	if s == nil || s.Transactions == nil || s.Progress == nil {
		return ErrDependencyMissing
	}
	if strings.TrimSpace(string(cmd.TradeID)) == "" ||
		strings.TrimSpace(cmd.StepCode) == "" ||
		cmd.ExpectedRevision == 0 {
		return marketflow.ErrInvalidInput
	}
	if !policy.Active {
		return marketflow.ErrNotEligible
	}
	if err := ValidateExecutionPolicy(policy); err != nil {
		return err
	}

	return s.Transactions.WithinTransaction(ctx, func(txctx context.Context) error {
		progress, revision, err := s.Progress.GetForUpdate(txctx, cmd.TradeID)
		if err != nil {
			return err
		}
		if revision != cmd.ExpectedRevision {
			return ErrVersionConflict
		}

		if progress.CompletedSteps[cmd.StepCode] {
			return nil
		}
		if err := progress.CanComplete(policy, cmd.StepCode); err != nil {
			return err
		}

		if progress.CompletedSteps == nil {
			progress.CompletedSteps = make(map[string]bool)
		}
		progress.CompletedSteps[cmd.StepCode] = true

		return s.Progress.Save(txctx, progress, revision)
	})
}

// Overflow-safe aggregation. The source marketflow function remains unchanged
// for backward compatibility; application use cases should call this function.

func AggregateCommoditySafe(
	id marketflow.ID,
	lots []marketflow.CommodityLot,
	minimumQuantity int64,
	now time.Time,
) (marketflow.CommodityAggregation, error) {
	if strings.TrimSpace(string(id)) == "" ||
		len(lots) == 0 ||
		minimumQuantity <= 0 ||
		now.IsZero() {
		return marketflow.CommodityAggregation{}, marketflow.ErrInvalidInput
	}

	first := lots[0]
	if strings.TrimSpace(first.CommodityCode) == "" ||
		strings.TrimSpace(first.Unit) == "" {
		return marketflow.CommodityAggregation{}, marketflow.ErrInvalidInput
	}

	result := marketflow.CommodityAggregation{
		ID:            id,
		CommodityCode: first.CommodityCode,
		Unit:          first.Unit,
		CreatedAt:     now.UTC(),
	}

	seen := make(map[marketflow.ID]struct{}, len(lots))

	for _, lot := range lots {
		if strings.TrimSpace(string(lot.ID)) == "" ||
			strings.TrimSpace(string(lot.OfferID)) == "" ||
			lot.Quantity <= 0 ||
			lot.CommodityCode != first.CommodityCode ||
			lot.Unit != first.Unit ||
			!lot.Verified ||
			!lot.AggregationAllowed {
			return marketflow.CommodityAggregation{}, marketflow.ErrNotEligible
		}

		if _, exists := seen[lot.ID]; exists {
			return marketflow.CommodityAggregation{}, marketflow.ErrConflict
		}
		seen[lot.ID] = struct{}{}

		if lot.Quantity > math.MaxInt64-result.TotalQuantity {
			return marketflow.CommodityAggregation{}, marketflow.ErrInvalidInput
		}

		result.TotalQuantity += lot.Quantity
		result.LotIDs = append(result.LotIDs, lot.ID)
	}

	if result.TotalQuantity < minimumQuantity {
		return marketflow.CommodityAggregation{}, marketflow.ErrNotEligible
	}

	return result, nil
}

// External legal requests require identity, permission and explicit scopes.
// The concrete LegalGateway adapter must enforce idempotency at the provider boundary.

type LegalRequestService struct {
	Identity marketflow.IdentityGateway
	Gateway  LegalGateway
}

func (s *LegalRequestService) Submit(
	ctx context.Context,
	actorID marketflow.ID,
	request marketflow.ExternalRequest,
	grantedScopes []string,
) (string, error) {
	if s == nil || s.Identity == nil || s.Gateway == nil {
		return "", ErrDependencyMissing
	}
	if strings.TrimSpace(string(actorID)) == "" {
		return "", marketflow.ErrInvalidInput
	}

	if err := s.Identity.VerifyIdentity(ctx, actorID); err != nil {
		return "", err
	}
	if err := s.Identity.Authorize(ctx, actorID, "legal.external.submit"); err != nil {
		return "", err
	}
	if err := request.ValidateAuthorization(grantedScopes); err != nil {
		return "", err
	}

	return s.Gateway.SubmitAuthorizedRequest(ctx, request)
}

// Platform position is deliberately independent from legal registration.

func RecordPlatformPosition(
	workflow *marketflow.PropertyWorkflow,
	confirmedTradeID marketflow.ID,
	now time.Time,
) error {
	if workflow == nil {
		return marketflow.ErrInvalidInput
	}

	legalStateBefore := workflow.LegalRegistration

	if err := workflow.RecordPlatformPosition(confirmedTradeID, now); err != nil {
		return err
	}

	if workflow.LegalRegistration != legalStateBefore {
		return fmt.Errorf("%w: platform position changed legal state", marketflow.ErrPolicyViolation)
	}

	return nil
}
