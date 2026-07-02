// Module registry — the Open/Closed seam of the platform.
//
// A module is registered once (src/modules/index.js) with a static manifest:
//
//   {
//     id: "donor-management",        // stable identifier, used in permissions & routes
//     title: "Donor Management",     // navigation label
//     icon: VolunteerActivismIcon,   // MUI icon component
//     group: "Operations",           // navigation group
//     path: "/donor-management",     // route base path
//     order: 20,                     // navigation sort order within group
//     routes: [                      // lazy route objects (React Router)
//       { index: true, lazy: () => import("./pages/DonorListPage.jsx") }
//     ]
//   }
//
// Nothing else in the codebase enumerates modules. Navigation, routing and
// permission scopes are all derived from this registry, so adding a module
// never touches shell, router or authorization code.

const modules = new Map();

export function registerModule(manifest) {
  if (!manifest?.id) {
    throw new Error("Module manifest requires an `id`.");
  }
  // Last registration wins so hot-module reloads can re-register safely.
  modules.set(manifest.id, Object.freeze({ order: 100, group: "General", ...manifest }));
}

export function getModules() {
  return [...modules.values()].sort((a, b) => a.order - b.order);
}

export function getModule(id) {
  return modules.get(id) ?? null;
}

export function getNavigationGroups(predicate = () => true) {
  const groups = new Map();
  for (const module of getModules()) {
    if (module.hidden || !predicate(module)) continue;
    if (!groups.has(module.group)) {
      groups.set(module.group, []);
    }
    groups.get(module.group).push(module);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}
