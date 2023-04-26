/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./storage-class-details.scss";

import React from "react";
import startCase from "lodash/startCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { disposeOnUnmount, observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { StorageClass } from "../../../common/k8s-api/endpoints";
import type { StorageClassStore } from "./store";
import { VolumeDetailsList } from "../+storage-volumes/volume-details-list";
import type { PersistentVolumeStore } from "../+storage-volumes/store";
import type { Logger } from "@k8slens/logging";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import storageClassStoreInjectable from "./store.injectable";
import persistentVolumeStoreInjectable from "../+storage-volumes/store.injectable";
import { loggerInjectionToken } from "@k8slens/logging";

export interface StorageClassDetailsProps extends KubeObjectDetailsProps<StorageClass> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  storageClassStore: StorageClassStore;
  persistentVolumeStore: PersistentVolumeStore;
  logger: Logger;
}

@observer
class NonInjectedStorageClassDetails extends React.Component<StorageClassDetailsProps & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.persistentVolumeStore,
      ]),
    ]);
  }

  render() {
    const { object: storageClass, storageClassStore } = this.props;

    if (!storageClass) {
      return null;
    }

    if (!(storageClass instanceof StorageClass)) {
      this.props.logger.error("[StorageClassDetails]: passed object that is not an instanceof StorageClass", storageClass);

      return null;
    }

    const persistentVolumes = storageClassStore.getPersistentVolumes(storageClass);
    const { provisioner, parameters, mountOptions } = storageClass;

    return (
      <div className="StorageClassDetails">
        {provisioner && (
          <DrawerItem name="Provisioner" labelsOnly>
            <Badge label={provisioner}/>
          </DrawerItem>
        )}
        <DrawerItem name="Volume Binding Mode">
          {storageClass.getVolumeBindingMode()}
        </DrawerItem>
        <DrawerItem name="Reclaim Policy">
          {storageClass.getReclaimPolicy()}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name="Mount Options">
            {mountOptions.join(", ")}
          </DrawerItem>
        )}
        {parameters && (
          <>
            <DrawerTitle>Parameters</DrawerTitle>
            {
              Object.entries(parameters).map(([name, value]) => (
                <DrawerItem key={name + value} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}
        <VolumeDetailsList persistentVolumes={persistentVolumes}/>
      </div>
    );
  }
}

export const StorageClassDetails = withInjectables<Dependencies, StorageClassDetailsProps>(NonInjectedStorageClassDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    storageClassStore: di.inject(storageClassStoreInjectable),
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
    logger: di.inject(loggerInjectionToken),
  }),
});

