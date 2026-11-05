// Local standalone auth & client configuration for Saurabh Malhotra

export interface LocalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  getIdToken: () => Promise<string>;
  providerData: Array<{ providerId: string }>;
}

export const defaultUser: LocalUser = {
  uid: "saurabh-malhotra",
  email: "saurabhmalhotra@example.com",
  displayName: "Saurabh Malhotra",
  photoURL: null,
  emailVerified: true,
  getIdToken: async () => "local-token-saurabh-malhotra",
  providerData: [{ providerId: "password" }],
};

export const auth = {
  currentUser: defaultUser,
};
