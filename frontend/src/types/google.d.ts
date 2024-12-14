interface Window {
  google: {
    accounts: {
      oauth2: {
        initCodeClient: (config: {
          client_id: string;
          scope: string;
          ux_mode: string;
          redirect_uri: string;
        }) => {
          requestCode: () => void;
        };
      };
    };
  };
} 