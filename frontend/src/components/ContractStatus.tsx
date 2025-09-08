import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBlockchain } from '../hooks/useBlockchain';

export const ContractStatus: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { 
    isInitialized, 
    loading, 
    error, 
    getSummaryStore,
    initializeSummaryStore 
  } = useBlockchain();
  
  const [storeDetails, setStoreDetails] = useState<{
    authority: string;
    totalSummaries: number;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadStoreDetails = async () => {
    if (!connected || !publicKey) return;
    
    setLoadingDetails(true);
    try {
      const store = await getSummaryStore();
      if (store) {
        setStoreDetails({
          authority: store.authority.toString(),
          totalSummaries: store.totalSummaries
        });
      } else {
        setStoreDetails(null);
      }
    } catch (err) {
      console.error('Error loading store details:', err);
      setStoreDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadStoreDetails();
    } else {
      setStoreDetails(null);
    }
  }, [isInitialized, connected, publicKey]);

  const handleInitialize = async () => {
    try {
      await initializeSummaryStore();
      // Reload details after initialization
      setTimeout(() => {
        loadStoreDetails();
      }, 1000);
    } catch (err) {
      console.error('Error initializing contract:', err);
    }
  };

  if (!connected) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        border: '1px solid #e5e7eb', 
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1rem'
          }}>
            🔗
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Contract Status</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Connect your wallet to check contract status
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      border: '1px solid #e5e7eb', 
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          backgroundColor: isInitialized ? '#d1fae5' : '#fef3c7', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1rem'
        }}>
          {isInitialized ? '✅' : '⚠️'}
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Contract Status</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Program ID: 2ZQqMy6V5cZjUpU8Y5F9MoJkXBLSLR2r1GiYuotMBhZu
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ 
            width: '1.5rem', 
            height: '1.5rem', 
            border: '2px solid #e5e7eb', 
            borderTop: '2px solid #2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 0.5rem'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Checking contract status...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: isInitialized ? '#f0fdf4' : '#fffbeb', 
            border: `1px solid ${isInitialized ? '#bbf7d0' : '#fed7aa'}`, 
            borderRadius: '0.5rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                  Summary Store
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  {isInitialized ? 'Initialized and ready' : 'Not initialized'}
                </p>
              </div>
              <div style={{ 
                width: '0.75rem', 
                height: '0.75rem', 
                backgroundColor: isInitialized ? '#10b981' : '#f59e0b', 
                borderRadius: '50%' 
              }}></div>
            </div>
          </div>

          {/* Store Details */}
          {isInitialized && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '0.5rem' 
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: '0 0 0.75rem 0' }}>
                Store Details
              </h4>
              {loadingDetails ? (
                <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>Loading details...</p>
              ) : storeDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Authority: </span>
                    <span style={{ fontSize: '0.75rem', color: '#111827', fontFamily: 'monospace' }}>
                      {storeDetails.authority}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Summaries: </span>
                    <span style={{ fontSize: '0.75rem', color: '#111827', fontWeight: '600' }}>
                      {storeDetails.totalSummaries}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>Failed to load details</p>
              )}
            </div>
          )}

          {/* Initialize Button */}
          {!isInitialized && (
            <button
              onClick={handleInitialize}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Initialize Contract
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '0.5rem' 
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', margin: '0 0 0.25rem 0' }}>
                Error
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
