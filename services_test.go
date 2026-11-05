package application

import (
	"errors"
	"math"
	"testing"
	"time"

	"github.com/igd-tesa/real-asset-management-platform/general-market-backend/internal/marketflow"
)

func TestValidateExecutionPolicyAcceptsOrderedDependencies(t *testing.T) {
	now := time.Now().UTC()

	policy := marketflow.ExecutionPolicy{
		ID:              "policy-1",
		Name:            "Physical delivery",
		Version:         1,
		OfferCategoryID: "category-1",
		Active:          true,
		CreatedAt:       now,
		Steps: []marketflow.ExecutionStep{
			{
				Code:        "contract",
				Order:       1,
				Requirement: marketflow.StepRequired,
			},
			{
				Code:        "delivery",
				Order:       2,
				Requirement: marketflow.StepRequired,
				DependsOn:   []string{"contract"},
			},
			{
				Code:        "settlement",
				Order:       3,
				Requirement: marketflow.StepRequired,
				DependsOn:   []string{"delivery"},
			},
		},
	}

	if err := ValidateExecutionPolicy(policy); err != nil {
		t.Fatalf("expected valid policy, got %v", err)
	}
}

func TestValidateExecutionPolicyRejectsCycle(t *testing.T) {
	now := time.Now().UTC()

	policy := marketflow.ExecutionPolicy{
		ID:              "policy-2",
		Name:            "Invalid cycle",
		Version:         1,
		OfferCategoryID: "category-1",
		Active:          true,
		CreatedAt:       now,
		Steps: []marketflow.ExecutionStep{
			{
				Code:        "a",
				Order:       1,
				Requirement: marketflow.StepRequired,
				DependsOn:   []string{"b"},
			},
			{
				Code:        "b",
				Order:       2,
				Requirement: marketflow.StepRequired,
				DependsOn:   []string{"a"},
			},
		},
	}

	if err := ValidateExecutionPolicy(policy); !errors.Is(err, ErrInvalidPolicyGraph) {
		t.Fatalf("expected ErrInvalidPolicyGraph, got %v", err)
	}
}

func TestValidateExecutionPolicyRejectsDuplicateOrder(t *testing.T) {
	now := time.Now().UTC()

	policy := marketflow.ExecutionPolicy{
		ID:              "policy-3",
		Name:            "Duplicate order",
		Version:         1,
		OfferCategoryID: "category-1",
		Active:          true,
		CreatedAt:       now,
		Steps: []marketflow.ExecutionStep{
			{Code: "a", Order: 1, Requirement: marketflow.StepRequired},
			{Code: "b", Order: 1, Requirement: marketflow.StepOptional},
		},
	}

	if err := ValidateExecutionPolicy(policy); !errors.Is(err, ErrInvalidPolicyGraph) {
		t.Fatalf("expected ErrInvalidPolicyGraph, got %v", err)
	}
}

func TestAggregateCommoditySafe(t *testing.T) {
	now := time.Now().UTC()

	result, err := AggregateCommoditySafe(
		"aggregation-1",
		[]marketflow.CommodityLot{
			{
				ID:                 "lot-1",
				OfferID:            "offer-1",
				CommodityCode:      "WHEAT",
				Quantity:           100,
				Unit:               "kg",
				Verified:           true,
				AggregationAllowed: true,
			},
			{
				ID:                 "lot-2",
				OfferID:            "offer-2",
				CommodityCode:      "WHEAT",
				Quantity:           200,
				Unit:               "kg",
				Verified:           true,
				AggregationAllowed: true,
			},
		},
		250,
		now,
	)

	if err != nil {
		t.Fatalf("unexpected aggregation error: %v", err)
	}
	if result.TotalQuantity != 300 {
		t.Fatalf("expected total 300, got %d", result.TotalQuantity)
	}
	if len(result.LotIDs) != 2 {
		t.Fatalf("expected 2 lots, got %d", len(result.LotIDs))
	}
}

func TestAggregateCommodityRejectsOverflow(t *testing.T) {
	now := time.Now().UTC()

	_, err := AggregateCommoditySafe(
		"aggregation-2",
		[]marketflow.CommodityLot{
			{
				ID:                 "lot-1",
				OfferID:            "offer-1",
				CommodityCode:      "WHEAT",
				Quantity:           math.MaxInt64,
				Unit:               "kg",
				Verified:           true,
				AggregationAllowed: true,
			},
			{
				ID:                 "lot-2",
				OfferID:            "offer-2",
				CommodityCode:      "WHEAT",
				Quantity:           1,
				Unit:               "kg",
				Verified:           true,
				AggregationAllowed: true,
			},
		},
		1,
		now,
	)

	if err == nil {
		t.Fatal("expected overflow rejection")
	}
}

func TestAggregateCommodityRejectsDuplicateLot(t *testing.T) {
	now := time.Now().UTC()

	lot := marketflow.CommodityLot{
		ID:                 "lot-1",
		OfferID:            "offer-1",
		CommodityCode:      "WHEAT",
		Quantity:           100,
		Unit:               "kg",
		Verified:           true,
		AggregationAllowed: true,
	}

	_, err := AggregateCommoditySafe(
		"aggregation-3",
		[]marketflow.CommodityLot{lot, lot},
		1,
		now,
	)

	if !errors.Is(err, marketflow.ErrConflict) {
		t.Fatalf("expected conflict, got %v", err)
	}
}

func TestCalculateOrderNotional(t *testing.T) {
	order := marketflow.Order{
		Side:     marketflow.Buy,
		Price:    250,
		Quantity: 4,
	}

	amount, err := CalculateOrderNotional(order)
	if err != nil {
		t.Fatal(err)
	}
	if amount != 1000 {
		t.Fatalf("expected 1000, got %d", amount)
	}
}

func TestCalculateOrderNotionalRejectsOverflow(t *testing.T) {
	order := marketflow.Order{
		Side:     marketflow.Buy,
		Price:    math.MaxInt64,
		Quantity: 2,
	}

	if _, err := CalculateOrderNotional(order); err == nil {
		t.Fatal("expected overflow rejection")
	}
}

func TestPlatformPositionDoesNotImplyLegalRegistration(t *testing.T) {
	workflow := &marketflow.PropertyWorkflow{
		ID:                "property-flow-1",
		OfferID:           "offer-1",
		TradeID:           "trade-1",
		PlatformPosition:  marketflow.PositionNotRecorded,
		LegalRegistration: marketflow.LegalPending,
		State:             marketflow.PropertyRegistration,
	}

	if err := RecordPlatformPosition(
		workflow,
		"trade-1",
		time.Now().UTC(),
	); err != nil {
		t.Fatal(err)
	}

	if workflow.PlatformPosition != marketflow.PositionRecorded {
		t.Fatal("platform position was not recorded")
	}
	if workflow.LegalRegistration != marketflow.LegalPending {
		t.Fatal("platform position must not imply legal registration")
	}
}
