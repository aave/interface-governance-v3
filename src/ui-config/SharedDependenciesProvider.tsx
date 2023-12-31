import { createContext, useContext } from 'react';
import { ApprovedAmountService } from 'src/services/ApprovedAmountService';
import { GovernanceService } from 'src/services/GovernanceService';
import { UiIncentivesService } from 'src/services/UIIncentivesService';
import { UiPoolService } from 'src/services/UIPoolService';
import { UiStakeDataService } from 'src/services/UiStakeDataService';
import { WalletBalanceService } from 'src/services/WalletBalanceService';
import { getNetworkConfig, getProvider } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { governanceConfig } from './governanceConfig';
import { stakeConfig } from './stakeConfig';

interface SharedDependenciesContext {
  governanceService: GovernanceService;
  governanceWalletBalanceService: WalletBalanceService;
  poolTokensBalanceService: WalletBalanceService;
  uiStakeDataService: UiStakeDataService;
  approvedAmountService: ApprovedAmountService;
  uiIncentivesService: UiIncentivesService;
  uiPoolService: UiPoolService;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC = ({ children }) => {
  const getGovernanceProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId);
    const isGovernanceFork =
      networkConfig.isFork && networkConfig.underlyingChainId === governanceConfig.chainId;
    return isGovernanceFork ? getProvider(chainId) : getProvider(governanceConfig.chainId);
  };
  const getStakeProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId);
    const isStakeFork =
      networkConfig.isFork && networkConfig.underlyingChainId === stakeConfig.chainId;
    return isStakeFork ? getProvider(chainId) : getProvider(stakeConfig.chainId);
  };

  // services
  const governanceService = new GovernanceService(getGovernanceProvider);

  const governanceWalletBalanceService = new WalletBalanceService(getGovernanceProvider);
  const poolTokensBalanceService = new WalletBalanceService(getProvider);
  const uiStakeDataService = new UiStakeDataService(getStakeProvider);
  const approvedAmountService = new ApprovedAmountService(getProvider);

  const uiPoolService = new UiPoolService(getProvider);
  const uiIncentivesService = new UiIncentivesService(getProvider);

  return (
    <SharedDependenciesContext.Provider
      value={{
        governanceService,
        governanceWalletBalanceService,
        poolTokensBalanceService,
        uiStakeDataService,
        approvedAmountService,
        uiPoolService,
        uiIncentivesService,
      }}
    >
      {children}
    </SharedDependenciesContext.Provider>
  );
};

export const useSharedDependencies = () => {
  const context = useContext(SharedDependenciesContext);
  invariant(context, 'Component should be wrapper inside a <SharedDependenciesProvider />');
  return context;
};
