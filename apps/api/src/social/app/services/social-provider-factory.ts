import { FacebookProvider } from "./providers/facebook-provider";
import { GoogleProvider } from "./providers/google-provider";
import { InstagramProvider } from "./providers/instagram-provider";
import { LinkedInProvider } from "./providers/linkedIn-provider";
import { TikTokProvider } from "./providers/tiktok-provider";
import { TwitterProvider } from "./providers/twitter-provider";
import { YouTubeProvider } from "./providers/youtube-provider";

const providers = {
  facebook: FacebookProvider,
  google: GoogleProvider,
  instagram: InstagramProvider,
  linkedin: LinkedInProvider,
  tiktok: TikTokProvider,
  twitter: TwitterProvider,
  youtube: YouTubeProvider,
} as const;

type ProviderMap = typeof providers;
type ProviderInstance<T extends keyof ProviderMap> = InstanceType<
  ProviderMap[T]
>;

export class ProviderFactory {
  private static providers = providers;

  static getProvider<T extends keyof ProviderMap>(
    platform: T
  ): ProviderInstance<T> {
    const Provider = this.providers[platform];
    if (!Provider) {
      throw new Error(`Provider not found for platform: ${platform}`);
    }
    return new Provider() as ProviderInstance<T>;
  }
}
