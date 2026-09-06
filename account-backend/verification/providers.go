package verification

import (
	"errors"
	"sync"
)

// ProviderManager مسئول ثبت و انتخاب Providerهای احراز است.
type ProviderManager struct {
	mu        sync.RWMutex
	providers map[string]Provider
}

// NewProviderManager یک ProviderManager جدید ایجاد می‌کند.
func NewProviderManager() *ProviderManager {
	return &ProviderManager{
		providers: make(map[string]Provider),
	}
}

// Register یک Provider را ثبت می‌کند.
func (m *ProviderManager) Register(provider Provider) error {
	if provider == nil {
		return errors.New("provider is nil")
	}

	name := provider.Name()

	if name == "" {
		return errors.New("provider name is empty")
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	m.providers[name] = provider

	return nil
}

// Get یک Provider را بر اساس نام آن برمی‌گرداند.
func (m *ProviderManager) Get(name string) (Provider, error) {
	if name == "" {
		return nil, errors.New("provider name is empty")
	}

	m.mu.RLock()
	defer m.mu.RUnlock()

	provider, exists := m.providers[name]

	if !exists {
		return nil, errors.New("provider not found")
	}

	return provider, nil
}

// Has بررسی می‌کند که Provider موردنظر ثبت شده است یا خیر.
func (m *ProviderManager) Has(name string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()

	_, exists := m.providers[name]

	return exists
}
