import { FeatureModule } from "@portal/feature-decorator";

@FeatureModule({
  id: "user-module",
  name: "User Management",
  version: "1.0.0",
  icon: "👤",
  description: "User profiles and authentication system",
  routes: [
    {
      path: "/users",
      name: "UserList",
      // use the remote: prefix so the shell knows to load this from the MF remote
      component: "remote:userModule/UserList",
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/profile",
      name: "UserProfile",
      component: "remote:userModule/UserProfile",
      meta: { requiresAuth: true },
    },
  ],
  permissions: ["user:read", "user:write", "user:delete", "user:admin"],
  dependencies: [],
})
export class UserFeatureModule {
  static initialize() {
    console.log("👤 User Module initialized");
  }
}

UserFeatureModule.initialize();
