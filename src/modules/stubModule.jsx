import { ComingSoonPage } from "../shared/components";

// Factory for modules that are registered on the platform (navigation,
// routing, permission scope) ahead of their first release. Demonstrates that
// adding a module is a manifest, not a code change.
export function createStubModule({ id, title, icon, group, order, description }) {
  function StubPage() {
    return <ComingSoonPage title={title} description={description} />;
  }

  return {
    id,
    title,
    icon,
    group,
    order,
    path: `/${id}`,
    routes: [{ index: true, Component: StubPage }]
  };
}
