import type { Result } from "@oppsys/types";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";

interface LinkedInUserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  username?: string;
  picture?: string;
}

interface LinkedInContent {
  text: string;
  media?: boolean;
  imageUrl?: string;
  altText?: string;
  title?: string;
}

interface LinkedInOrganization {
  id: string;
  name?: string;
  logo?: string;
}

interface PublishResult {
  success: boolean;
  postId: string;
  platform: string;
  url: string;
}

interface PostStatistics {
  likes: number;
  comments: number;
  shares: number;
}

// Types pour les réponses des API LinkedIn
type LinkedInApiError = {
  message?: string;
  error?: string;
  error_description?: string;
};
type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};
type LinkedInLiteProfileResponse = {
  id: string;
  firstName: { localized: { en_US: string } };
  lastName: { localized: { en_US: string } };
  profilePicture: {
    "displayImage~": { elements: { identifiers: { identifier: string }[] }[] };
  };
};
type LinkedInEmailResponse = {
  elements: { "handle~": { emailAddress: string } }[];
};
type LinkedInUgcPostResponse = { id: string };
type LinkedInOrganizationResponse = {
  elements: {
    "organization~": {
      id: string;
      name: { localized: { en_US: string } };
      logoV2: {
        "cropped~": { elements: { identifiers: { identifier: string }[] }[] };
      };
    };
  }[];
};
type LinkedInPostStatsResponse = {
  numLikes: number;
  numComments: number;
  numShares: number;
};

export class LinkedInProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID!;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    this.baseUrl = "https://www.linkedin.com/oauth/v2/authorization";
    this.tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    this.apiUrl = "https://api.linkedin.com/v2";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("LinkedIn OAuth credentials not configured");
    }
  }

  async getAuthUrl(state: string, redirectUri?: string): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope:
        "r_liteprofile r_emailaddress w_member_social rw_organization_admin",
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<Result<SocialProviderTokenData, Error>> {
    return tryCatch(async () => {
      const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
      const redirect = redirectUri || defaultRedirectUri;

      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirect,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok)
        throw new Error(
          `LinkedIn token exchange failed: ${await response.text()}`
        );

      const data = (await response.json()) as LinkedInTokenResponse &
        LinkedInApiError;
      if (data.error)
        throw new Error(
          `LinkedIn error: ${data.error_description || data.error}`
        );

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || null,
          expiresAt: expiresAt,
          tokenType: data.token_type || "Bearer",
          scope: data.scope,
        },
      };
    });
  }

  async getUserProfile(
    accessToken: string
  ): Promise<Result<LinkedInUserProfile, Error>> {
    return tryCatch(async () => {
      const profileResponse = await fetch(
        `${this.apiUrl}/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!profileResponse.ok)
        throw new Error(
          `LinkedIn profile API error: ${profileResponse.status}`
        );
      const profileData =
        (await profileResponse.json()) as LinkedInLiteProfileResponse &
          LinkedInApiError;
      if (profileData.message)
        throw new Error(`LinkedIn profile API error: ${profileData.message}`);

      const emailResponse = await fetch(
        `${this.apiUrl}/emailAddress?q=members&projection=(elements*(handle~))`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      let email: string | null = null;
      if (emailResponse.ok) {
        const emailData = (await emailResponse.json()) as LinkedInEmailResponse;
        email = emailData.elements?.[0]?.["handle~"]?.emailAddress;
      }

      const pictureUrl =
        profileData.profilePicture?.["displayImage~"]?.elements?.slice(-1)[0]
          ?.identifiers[0]?.identifier;

      return {
        success: true,
        data: {
          id: profileData.id,
          name: `${profileData.firstName?.localized?.en_US || ""} ${profileData.lastName?.localized?.en_US || ""}`.trim(),
          firstName: profileData.firstName?.localized?.en_US,
          lastName: profileData.lastName?.localized?.en_US,
          email: email,
          username: email?.split("@")[0],
          picture: pictureUrl,
        },
      };
    });
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<Result<SocialProviderTokenData, Error>> {
    return tryCatch(async () => {
      void refreshToken;
      // LinkedIn API v2 ne supporte plus le rafraîchissement programmatique des tokens de cette manière.
      // L'utilisateur doit se ré-authentifier.
      throw new Error(
        "LinkedIn does not support programmatic refresh tokens. User needs to re-authenticate."
      );
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const response = await fetch(`${this.apiUrl}/me?projection=(id)`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        success: true,
        data: response.ok,
      };
    });
  }

  private async getAuthorUrn(
    accessToken: string
  ): Promise<Result<string, Error>> {
    return tryCatch(async () => {
      const response = await fetch(`${this.apiUrl}/me?projection=(id)`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error("Failed to get LinkedIn profile for posting");
      const profileData = (await response.json()) as { id: string };
      return {
        success: true,
        data: `urn:li:person:${profileData.id}`,
      };
    });
  }

  async publishPost(
    accessToken: string,
    content: LinkedInContent
  ): Promise<Result<PublishResult, Error>> {
    return tryCatch(async () => {
      const authorUrnResult = await this.getAuthorUrn(accessToken);
      if (!authorUrnResult.success) throw authorUrnResult.error;

      const publishResult = await this.publish(
        accessToken,
        authorUrnResult.data,
        content
      );
      if (!publishResult.success) throw publishResult.error;

      return {
        success: true,
        data: publishResult.data,
      };
    });
  }

  async publishCompanyPost(
    accessToken: string,
    organizationId: string,
    content: LinkedInContent
  ): Promise<Result<PublishResult, Error>> {
    return tryCatch(async () => {
      const authorUrn = `urn:li:organization:${organizationId}`;
      const publishResult = await this.publish(accessToken, authorUrn, content);
      if (!publishResult.success) throw publishResult.error;

      return {
        success: true,
        data: publishResult.data,
      };
    });
  }

  private async publish(
    accessToken: string,
    authorUrn: string,
    content: LinkedInContent
  ): Promise<Result<PublishResult, Error>> {
    return tryCatch(async () => {
      const postPayload = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content.text },
            shareMediaCategory: content.imageUrl ? "IMAGE" : "NONE",
            ...(content.imageUrl && {
              media: [
                {
                  status: "READY",
                  description: { text: content.altText || "" },
                  media: content.imageUrl,
                  title: { text: content.title || "" },
                },
              ],
            }),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const response = await fetch(`${this.apiUrl}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postPayload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as LinkedInApiError;
        throw new Error(
          `LinkedIn UGC post error: ${errorData.message || response.status}`
        );
      }

      const publishData = (await response.json()) as LinkedInUgcPostResponse;
      return {
        success: true,
        data: {
          success: true,
          postId: publishData.id,
          platform: "linkedin",
          url: `https://linkedin.com/feed/update/${publishData.id}`,
        },
      };
    });
  }

  async getUserOrganizations(
    accessToken: string
  ): Promise<Result<LinkedInOrganization[], Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(id,name,logoV2(cropped~:playableStreams))))`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get user organizations: ${response.status}`);

      const data = (await response.json()) as LinkedInOrganizationResponse;
      const organizations =
        data.elements?.map((org) => {
          const organizationData = org["organization~"];
          return {
            id: organizationData.id,
            name: organizationData.name?.localized?.en_US,
            logo: organizationData.logoV2?.["cropped~"]?.elements?.slice(-1)[0]
              ?.identifiers[0]?.identifier,
          };
        }) || [];

      return {
        success: true,
        data: organizations,
      };
    });
  }

  async getPostStatistics(
    accessToken: string,
    postId: string
  ): Promise<Result<PostStatistics, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/socialActions/${postId}?projection=(numLikes,numComments,numShares)`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get post statistics: ${response.status}`);

      const data = (await response.json()) as LinkedInPostStatsResponse;
      return {
        success: true,
        data: {
          likes: data.numLikes || 0,
          comments: data.numComments || 0,
          shares: data.numShares || 0,
        },
      };
    });
  }
}
