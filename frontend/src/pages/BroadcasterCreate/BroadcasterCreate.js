import chains from 'constants/chains.json';
import chaincastChains from 'constants/chaincast-chains.json';

import MainLayout from 'layouts/MainLayout';

export default function BroadcasterCreatePage() {
  // Prepare chain options
  const chaincastChainIds = Object.keys(chaincastChains).map((key) =>
    parseInt(key, 10),
  );
  const chainOptions = chains
    .filter((chain) => chaincastChainIds.includes(chain.chainId))
    .map((chain) => {
      return {
        value: chain.chainId,
        text: chain.name,
      };
    });
  return (
    <MainLayout>
      <div className="container-sm">
        <div className="row">
          <div className="col-md-6 offset-md-2">
            <h1>Register your DAO</h1>
            <p>
              By registering your DAO, your address will be able to post
              broadcasts on your DAO's behalf.
            </p>
            <form>
              <div className="mb-4">
                <label htmlFor="daoName" className="form-label">
                  DAO's Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="daoName"
                  aria-describedby="daoNameHelp"
                />
                <div id="daoNameHelp" className="form-text">
                  The name of the DAO you represent.
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="daoPrimaryNetwork" className="form-label">
                  Primary Network of the DAO
                </label>
                <select
                  className="form-select"
                  aria-label="Primary Network"
                  id="daoPrimaryNetwork"
                >
                  <option>Choose a Primary Network</option>
                  {chainOptions.map((chainOption) => (
                    <option key={chainOption.value} value={chainOption.value}>
                      {chainOption.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="daoWebsite" className="form-label">
                  DAO's Website
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="daoWebsite"
                  aria-describedby="daoWebsiteHelp"
                />
                <div id="daoWebsiteHelp" className="form-text">
                  The main website of the DAO you represent.
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
