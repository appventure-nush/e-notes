export default class User {
  uid: string;

  nickname?: string;
  roles: string[];
  admin: boolean;
  permissions: Map<string, boolean>;
}
