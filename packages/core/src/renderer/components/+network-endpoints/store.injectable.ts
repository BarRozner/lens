/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import endpointsApiInjectable from "../../../common/k8s-api/endpoints/endpoint.api.injectable";
import { loggerInjectionToken } from "@k8slens/logging";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { EndpointsStore } from "./store";

const endpointsStoreInjectable = getInjectable({
  id: "endpoints-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectable), "endpointsStore is only available in certain environments");

    const api = di.inject(endpointsApiInjectable);

    return new EndpointsStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default endpointsStoreInjectable;
