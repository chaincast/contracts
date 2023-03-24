import React from 'react';

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from 'ethers';

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import BroadcastsArtifact from '../../contracts/Broadcasts.json';
import contractAddress from '../../contracts/contract-address.json';

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from '../../components/NoWalletDetected';
import { ConnectWallet } from '../../components/ConnectWallet';
// import { Loading } from '../../components/Loading';
// import { Transfer } from '../../components/Transfer';
import { TransactionErrorMessage } from '../../components/TransactionErrorMessage';
import { WaitingForTransactionMessage } from '../../components/WaitingForTransactionMessage';
// import { NoTokensMessage } from '../../components/NoTokensMessage';
import MainLayout from 'layouts/MainLayout';

// This is the Hardhat Network id that we set in our hardhat.config.js.
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '1337';

export class LandingPage extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  async componentDidMount() {
    // Check if wallet already connected and connect without prompt
    const ethStateAccount = window.ethereum._state.accounts;
    if (ethStateAccount?.length) {
      this._connectWallet();
    }
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If everything is loaded, we render the application.
    return (
      <MainLayout>
        <div className="container p-4">
          <div className="row">
            <div className="col-12">
              <h1>Chaincast Proof of Concept</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <p>
                Welcome <b>{this.state.selectedAddress}</b>, this is a proof of
                concept for Chaincast. Chaincast aims to help DAOs and projects
                stay in touch with their stakeholders.
              </p>
              <p>
                It accomplishes this by providing a single, normalized, resource
                for stakeholders to get their updates from. A stakeholder can
                select to receive updates from all the DAOs they are invested
                in. They are also able to fine tune the amount and importance of
                updates they are going to get.
              </p>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-12">
              <h2>Available Features</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <a
                href="/updates"
                className="btn btn-primary btn-lg"
                role="button"
              >
                Updates
              </a>
              <p>Read all the available DAO Updates</p>
            </div>
            <div className="col">
              <a
                href="/publish"
                className="btn btn-primary btn-lg"
                role="button"
              >
                Publish
              </a>
              <p>
                Publish a new update (you have to register a Broadcaster first).
              </p>
            </div>
            <div className="col">
              <a
                href="/broadcasters/create"
                className="btn btn-primary btn-lg"
                role="button"
              >
                Register
              </a>
              <p>Register a new Broadcaster and publish broadcasts.</p>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              {/*
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
              {this.state.txBeingSent && (
                <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
              )}

              {/*
              Sending a transaction can fail in multiple ways.
              If that happened, we show a message here.
            */}
              {this.state.transactionError && (
                <TransactionErrorMessage
                  message={this._getRpcErrorMessage(
                    this.state.transactionError,
                  )}
                  dismiss={() => this._dismissTransactionError()}
                />
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  componentWillUnmount() {}

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on('accountsChanged', ([newAddress]) => {
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on('chainChanged', ([networkId]) => {
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._chainCastContract = new ethers.Contract(
      contractAddress.Broadcasts,
      BroadcastsArtifact.abi,
      this._provider.getSigner(0),
    );
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545',
    });

    return false;
  }
}
