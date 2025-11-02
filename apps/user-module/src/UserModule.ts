import { FeatureModule } from "portal/feature-decorator";

@FeatureModule({
  id: "user-module",
  label: "User Management",
  version: "1.0.0",
  icon: "👤",
  description: "User profiles and authentication system",
  features: [
    {
      id: "user-list",
      path: "/users",
      label: "UserList",
      // use the remote: prefix so the shell knows to load this from the MF remote
      component: "UserList",
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      id: "user-profile",
      path: "/profile",
      label: "UserProfile",
      component: "UserProfile",
      meta: { requiresAuth: true },
    },
  ],
  permissions: ["user:read", "user:write", "user:delete", "user:admin"]
})
export class UserFeatureModule {
  static initialize() {
    console.log("👤 User Module initialized");
  }
}

console.log("### UserFeatureModule")

UserFeatureModule.initialize();
