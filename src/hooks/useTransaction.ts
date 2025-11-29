import type { Hex as HexAddress } from "viem";
import { useSendCalls } from "wagmi";

export type TransactionCall = {
  to: HexAddress;
  data?: HexAddress;
  value?: bigint;
};

export type TransactionProps = {
  calls: TransactionCall[];
};

export function useTransaction() {
  const { sendCallsAsync } = useSendCalls();

  async function execute(props: TransactionProps) {
    console.log("executing transaction...");
    const { calls } = props;

    try {
      // Call sendCallsAsync with proper structure
      const result = await sendCallsAsync({
        calls,
        version: "1",
      } as any);

      console.log("transaction-success:: ", result);

      return {
        success: true,
        error: null,
        data: { ...result, usedSessionKey: false },
      };
    } catch (error) {
      console.log("transaction-error: ", error);

      return {
        success: false,
        error,
        data: null,
      };
    }
  }

  return {
    execute,
  };
}

