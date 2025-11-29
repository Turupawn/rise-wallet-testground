import { parseEther } from "viem";

// Permissions for session key - allow all calls
// The API requires valid 'to' (address format) or 'signature' (string)
// To allow all calls, we provide a valid signature format (4-byte function selector)
// Using "0x00000000" as a wildcard signature
export const PERMISSIONS = {
  calls: [
    {
      signature: "0x00000000", // 4-byte function selector format - might be interpreted as wildcard
      // Omitting 'to' should mean "all contracts"
    },
  ],
  spend: [
    {
      limit: parseEther("1"), // Will be converted to hex string in the hook - Allow up to 1 ETH per period
      period: "minute" as const,
    },
  ],
};

