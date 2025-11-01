import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";

export const sharedPlugins = [
    viteTsconfigPaths({
        useTsconfigDeclarationDir: true
        })
    ];
