/**
 * The four-tab shell (Story 1.8) — `HOME · INVESTIGATE · FIELD JOURNAL · PROFILE`.
 *
 * `expo-router`'s `Tabs` owns the navigation state; the design's `TabBar`
 * primitive is handed in as the `tabBar` render prop, so the shell's look is the
 * design's while the router drives selection. The labels are **read from
 * `TabBar`'s own `TAB_IDS`** (through `TAB_ROUTES`), never re-authored here.
 *
 * Exactly four `Tabs.Screen`s are declared — the four tab routes — and there is
 * no Equipment tab and no Settings tab (AD-29). Hunt and Session are siblings of
 * this group, not children, so the tab bar is *structurally* absent there and
 * "hidden during Brief and Session" needs no per-screen conditional.
 *
 * `headerShown: false` everywhere: the tabs carry their own content, and the
 * product draws no navigation chrome.
 */

import { Tabs } from 'expo-router';

import { TAB_ROUTE_NAMES, TAB_ROUTES } from '@/features/shell/navigation';
import { TabBar, TAB_IDS, type TabId } from '@/ui/components/TabBar';

/**
 * The tab whose route is `name`. The derived `Tabs.Screen` list below makes an
 * unmapped name unreachable in practice; `TabBar` still needs one of the four,
 * so the first is the defensive fallback. The route *list* is not hardcoded
 * here — it is derived from `TAB_ROUTE_NAMES`, the declaration's own order.
 */
function tabForRoute(name: string | undefined): TabId {
  return TAB_IDS.find((id) => TAB_ROUTES[id] === name) ?? TAB_IDS[0];
}

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index]?.name;
        return (
          <TabBar
            activeTab={tabForRoute(activeRoute)}
            onSelect={(tab) => {
              props.navigation.navigate(TAB_ROUTES[tab]);
            }}
          />
        );
      }}
    >
      {TAB_ROUTE_NAMES.map((name) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
