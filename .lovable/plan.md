

## Complete Wallet Integration Enhancement

This plan implements three wallet-related features:
1. Display connected wallet address in the Navbar
2. Add WalletConnect support for mobile QR code scanning
3. Add wallet disconnect/unlink feature in Settings page

---

## System Analysis Summary

### Current State
- **Wallet Authentication**: Implemented with MetaMask, Trust Wallet, and Rabby support via EIP-191 signature verification
- **Database Schema**: `profiles.wallet_address` field exists; `wallet_nonces` and `wallet_sessions` tables in place
- **AuthContext**: Already tracks `walletAddress` in user state
- **Navbar**: Currently shows login/dashboard buttons but no wallet indicator
- **Settings**: Has security section but no wallet management UI

### Issues Identified
- Navbar doesn't display connected wallet address when logged in via wallet
- No WalletConnect support for mobile users
- No way to disconnect/unlink wallet from account in Settings
- Missing wallet icons in `/public/wallets/` directory

---

## Implementation Plan

### Feature 1: Display Wallet Address in Navbar

**File: `src/components/layout/Navbar.tsx`**

Changes:
- Import `Wallet` icon and `formatWalletAddress` utility
- Add wallet address display when user is authenticated and has a wallet connected
- Show abbreviated address (0x1234...5678) with wallet icon
- Add tooltip showing full address on hover
- Responsive design: Full display on desktop, icon-only on mobile

```text
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] │ Home │ Pricing │ Dashboard │     │ 🔗 0x1a2b...3c4d │ │
└─────────────────────────────────────────────────────────────────┘
```

**Technical Details:**
- Access `user.walletAddress` from `useAuth()` hook
- Use `formatWalletAddress()` from wallet service
- Add click-to-copy functionality for address
- Display as a styled badge/chip component

---

### Feature 2: Add WalletConnect Support

**Overview:**
WalletConnect v2 allows mobile wallet users to scan a QR code to connect. This requires:
- Installing `@walletconnect/modal` or using standalone WalletConnect
- Configuring with a WalletConnect Cloud project ID
- Adding WalletConnect as a wallet option in the modal

**New Dependencies:**
```json
{
  "@walletconnect/modal": "^2.6.2",
  "@walletconnect/ethereum-provider": "^2.11.0"
}
```

**File: `src/services/wallet/walletService.ts`**

Updates:
- Add `walletconnect` to `WalletType` union
- Implement `connectWalletConnect()` function
- Update `detectWallets()` to include WalletConnect option (always available)
- Handle WalletConnect provider events

**File: `src/components/WalletModal.tsx`**

Updates:
- Add WalletConnect option with QR code icon
- Show "Scan with mobile wallet" description
- Handle WalletConnect connection flow

**File: `src/hooks/useWalletAuth.ts`**

Updates:
- Support WalletConnect provider for signing
- Handle WalletConnect session management

**Configuration:**
- WalletConnect requires a project ID from cloud.walletconnect.com
- Store as environment variable `VITE_WALLETCONNECT_PROJECT_ID`

---

### Feature 3: Wallet Disconnect in Settings

**File: `src/pages/Settings.tsx`**

Add new "Connected Wallet" card section:
- Display connected wallet address when present
- Show wallet type (MetaMask, Trust, etc.)
- "Disconnect Wallet" button to unlink from account
- Confirmation dialog before unlinking

```text
┌─────────────────────────────────────────────────────────────────┐
│ 🔗 Connected Wallet                                             │
│ ─────────────────────────────────────────────────────────────── │
│ Address: 0x1a2b3c4d5e6f7g8h9i0j...                              │
│ Connected via: MetaMask                                          │
│                                                      [Disconnect]│
└─────────────────────────────────────────────────────────────────┘
```

**File: `src/services/wallet/walletService.ts`**

Add function:
- `unlinkWallet(userId: string)`: Removes wallet_address from profile, clears localStorage

**File: `src/contexts/AuthContext.tsx`**

Add function:
- `unlinkWallet()`: Calls backend to remove wallet, updates local state

**Backend: `supabase/functions/wallet-auth/index.ts`**

Add new action:
- `action: 'unlink'`: Removes wallet_address from user's profile
- Invalidates active wallet_sessions for that wallet
- Requires authentication (user must be logged in)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/layout/Navbar.tsx` | Modify | Add wallet address display |
| `src/components/WalletAddressBadge.tsx` | Create | Reusable wallet address display component |
| `src/services/wallet/walletService.ts` | Modify | Add WalletConnect support and unlink function |
| `src/hooks/useWalletAuth.ts` | Modify | Support WalletConnect provider |
| `src/components/WalletModal.tsx` | Modify | Add WalletConnect option |
| `src/pages/Settings.tsx` | Modify | Add wallet management section |
| `src/contexts/AuthContext.tsx` | Modify | Add unlinkWallet function |
| `supabase/functions/wallet-auth/index.ts` | Modify | Add unlink action |
| `public/wallets/walletconnect.svg` | Create | WalletConnect icon |

---

## Database Changes

No schema changes required - existing `profiles.wallet_address` and `wallet_sessions` tables are sufficient.

**Backend Logic for Unlink:**
```sql
-- Clear wallet_address from profile
UPDATE profiles SET wallet_address = NULL WHERE id = user_id;

-- Invalidate wallet sessions
UPDATE wallet_sessions SET is_active = false WHERE user_id = user_id;
```

---

## Detailed Component Specifications

### WalletAddressBadge Component

```
Props:
- address: string (wallet address)
- showCopyButton?: boolean
- className?: string

Features:
- Displays abbreviated address (0x1234...5678)
- Click-to-copy with toast notification
- Wallet icon indicator
- Tooltip with full address
```

### Updated Navbar Layout

When authenticated with wallet:
```
Desktop: [Logo] [Nav Links] [Language] [RoleSwitcher] [WalletBadge] [Dashboard]
Mobile:  [Logo] [WalletIcon] [Menu]
```

### Settings Wallet Section

Positioned after Profile section, before Notifications:
- Only visible if `user.walletAddress` exists
- Shows formatted address with copy functionality
- Disconnect button with confirmation dialog
- After disconnect, section is hidden

---

## WalletConnect Integration Details

**Initialization Flow:**
1. User clicks "WalletConnect" in modal
2. App creates WalletConnect provider with project ID
3. QR code modal opens (handled by WalletConnect SDK)
4. User scans with mobile wallet
5. Once connected, proceed with signature verification (same as other wallets)

**Project ID Requirement:**
- WalletConnect v2 requires a project ID from cloud.walletconnect.com
- For development, a default demo project ID can be used
- For production, user should create their own project

---

## Security Considerations

1. **Unlink Action**: Only authenticated users can unlink their own wallet
2. **Session Invalidation**: All wallet sessions are invalidated on unlink
3. **RLS Policies**: Existing policies protect wallet operations
4. **No Private Keys**: App never handles private keys; only signatures

---

## Verification Checklist

After implementation:

| Test | Expected Result |
|------|-----------------|
| Login with MetaMask | Wallet address appears in navbar |
| Click wallet badge | Full address copied to clipboard |
| Open WalletConnect option | QR code modal appears |
| Scan QR with mobile wallet | Authentication completes |
| Navigate to Settings | Wallet section visible with address |
| Click Disconnect | Confirmation dialog appears |
| Confirm Disconnect | Wallet unlinked, section hidden |
| Try wallet login again | Can reconnect wallet |
| Logout and login with email | No wallet address shown |

---

## Implementation Order

1. Create `WalletAddressBadge` component (standalone, reusable)
2. Update Navbar to display wallet address
3. Add WalletConnect service functions
4. Update WalletModal with WalletConnect option
5. Update useWalletAuth for WalletConnect
6. Update wallet-auth edge function with unlink action
7. Update AuthContext with unlinkWallet
8. Add wallet section to Settings page
9. Create wallet icons
10. Test complete flow

