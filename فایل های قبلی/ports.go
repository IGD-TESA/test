package application

import (
	"context"
	"time"

	cataloguedomain "github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/catalogue/domain"
	marketdomain "github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/market/domain"
	"github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/marketflow"
)

// TransactionManager must bind all repositories used inside the callback
// to one database transaction. It must commit or roll back atomically.
type TransactionManager interface {
	WithinTransaction(context.Context, func(context.Context) error) error
}

type Clock interface {
	Now() time.Time
}

type IDGenerator interface {
	NewID(context.Context, string) (marketflow.ID, error)
}

// Market and Catalogue integration.

type MarketReader interface {
	GetMarket(context.Context, marketdomain.MarketID) (*marketdomain.Market, error)
}

type CategoryReader interface {
	GetCategory(context.Context, cataloguedomain.CategoryID) (*cataloguedomain.Category, error)
}

type CategoryMappingReader interface {
	GetMapping(
		context.Context,
		marketdomain.MarketID,
		cataloguedomain.CategoryID,
		cataloguedomain.CategoryID,
	) (*cataloguedomain.CategoryMapping, error)
}

// Offer readiness must validate the immutable configuration version,
// parameter values, required documents and specialized qualification.
type OfferBusinessValidator interface {
	ValidateConfigurationAndEligibility(context.Context, marketflow.Offer) error
}

// Supply request repositories must lock rows and enforce expected revisions.

type SupplyRequestCommandRepository interface {
	GetForUpdate(context.Context, marketflow.ID) (marketflow.SupplyRequest, uint64, error)
	Save(context.Context, marketflow.SupplyRequest, uint64) error
}

type ProposalCommandRepository interface {
	GetForUpdate(context.Context, marketflow.ID) (marketflow.SupplyProposal, uint64, error)
	Save(context.Context, marketflow.SupplyProposal, uint64) error
}

type ProposalValidator interface {
	ValidateProposal(context.Context, marketflow.SupplyRequest, marketflow.SupplyProposal) error
}

// Order resource reservation must be idempotent by key.
// The adapter must support recovery of reservations whose order write
// did not complete. Buy and sell reservations are handled according to side.
type OrderResourceGateway interface {
	ReserveForOrder(context.Context, marketflow.Order, int64, string) (marketflow.ID, error)
	ReleaseOrderResources(context.Context, marketflow.ID, string) error
}

type OrderAdmissionValidator interface {
	ValidateOrder(context.Context, marketflow.Order) error
}

type OrderCommandRepository interface {
	GetByIdempotencyKey(context.Context, string) (marketflow.Order, bool, error)
	CreateOrder(context.Context, marketflow.Order, string, marketflow.ID) (marketflow.Order, error)
}

// The following methods must execute in the same transaction.
// LockBestCrossingPair must lock both orders and return a valid crossing pair.
type OrderBookCommandRepository interface {
	LockBestCrossingPair(context.Context, marketflow.ID, marketflow.ID) (marketflow.Order, marketflow.Order, error)
	SaveOrder(context.Context, marketflow.Order, uint64) error
	SaveMatch(context.Context, MatchRecord, string) error
}

type ExecutionProgressCommandRepository interface {
	GetForUpdate(context.Context, marketflow.ID) (marketflow.ExecutionProgress, uint64, error)
	Save(context.Context, marketflow.ExecutionProgress, uint64) error
}

type TradeCommandRepository interface {
	GetForUpdate(context.Context, marketflow.ID) (marketflow.Trade, error)
	Save(context.Context, marketflow.Trade, uint64) error
}

// LegalGateway adapters must enforce the request's idempotency key,
// authorized scope and correlation identifier at the external boundary.
type LegalGateway interface {
	SubmitAuthorizedRequest(context.Context, marketflow.ExternalRequest) (string, error)
	GetRequestResult(context.Context, string) (string, error)
}

// MatchRecord is an immutable result of one committed match.
type MatchRecord struct {
	ID          marketflow.ID
	MarketID    marketflow.ID
	OfferID     marketflow.ID
	BuyOrderID  marketflow.ID
	SellOrderID marketflow.ID
	BuyerID     marketflow.ID
	SellerID    marketflow.ID
	Quantity    int64
	Price       int64
	CreatedAt   time.Time
}
