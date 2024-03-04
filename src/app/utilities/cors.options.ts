import { ConfigService } from '@nestjs/config';

export const sparky_cors_options =
  (config: ConfigService) =>
  async (
    origin: string,
    callback: (error: Error, origins: string[]) => void,
  ) => {
    // a list of origins from a backing database
    const allowed_hosts = config.get('ALLOWED_HOSTS').split(',');

    if (origin) {

      if (origin != config.get('ALLOWED_HOSTS')[0]) {
        // verify foreign origin
        // const result = await findOriginFromConfig(origin);
        // if (result) {
        //   allowedHosts.push(origin);
        // }
      }

    }

    callback(undefined, allowed_hosts);
  };
