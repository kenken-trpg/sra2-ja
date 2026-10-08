
import type { SystemConfig } from "../module/config/system.ts";
import type { SRA2System } from "../module/sra2-system.ts";
import type * as models from "../module/models/_module.ts";
import type * as documents from "../module/documents/_module.ts";
import type * as applications from "../module/applications/_module.ts";
import type { registerDiceSoNice } from "../module/helpers/dice-so-nice.js";
declare global {
  var SYSTEM: SystemConfig;

  interface System {
    sra2?: SRA2System;
    api?: {
      applications: typeof applications;
      models: typeof models;
      documents: typeof documents;
    };
  }

  interface DataModelConfig {
    Item: {
      feat: typeof models.FeatDataModel;
      skill: typeof models.SkillDataModel;
      specialization: typeof models.SpecializationDataModel;
      metatype: typeof models.MetatypeDataModel;
    };
    Actor: {
      character: typeof models.CharacterDataModel;
      vehicle: typeof models.VehicleDataModel;
      ice: typeof models.IceDataModel;
      server: typeof models.ServerDataModel;
    };
  }
}

declare module '@league-of-foundry-developers/foundry-vtt-types/configuration' {
  namespace Hooks {
    interface HookConfig {
      /** Optional Dice So Nice module integration. */
      diceSoNiceReady: (dice3d: Parameters<typeof registerDiceSoNice>[0]) => void;
      /** Legacy sidebar render hook retained alongside renderActorDirectory. */
      renderSidebarTab: (app: { tabName: string }, html: JQuery | HTMLElement, data: object) => void;
    }
  }
}
