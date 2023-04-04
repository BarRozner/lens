/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import reactiveTrayMenuIconInjectable from "./reactive.injectable";

const stopReactiveTrayMenuIconInjectable = getInjectable({
  id: "stop-reactive-tray-menu-icon",

  instantiate: (di) => ({
    run: () => {
      const reactiveTrayMenuIcon = di.inject(reactiveTrayMenuIconInjectable);

      reactiveTrayMenuIcon.stop();
    },
  }),

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopReactiveTrayMenuIconInjectable;
