/**
 * Japanese names for the NPC generator's gear templates.
 *
 * npc-generator-data.ts carries French and English names on every template
 * (`name` / `nameEn`), and the generator writes one of them into the created
 * actor's items. Those templates have no id or slug: their identity is the
 * French `name` string. Rather than add a third field to the 835 KB upstream
 * table — which would collide on every merge from upstream — the Japanese
 * names live here, keyed by the French name, and a template with no entry
 * falls back to English exactly as before.
 *
 * The key is nested under featType because the same French name exists as a
 * spell, an adept power and a trait, and upstream gives some of those
 * different English names (Résistance à la douleur is Pain Relief, Pain
 * Resistance and Pain Tolerance). A flat map would silently merge them.
 *
 * Nothing here comes from a rulebook: the products are the upstream author's
 * own inventions. Only the category word is translated; the invented product
 * name stays in Latin script, as SRA2.FEATS.WEAPON.TYPES.* already does for
 * the real-world weapon names.
 *
 * A key that no longer matches a template would silently stop working, so
 * npc-generator-data-ja.test.ts fails on one.
 */

export const FEAT_NAMES_JA: Record<string, Record<string, string>> = {
  armor: {
    'Veste synthécuir renforcée': '強化シンセレザー・ジャケット',
    'Hoodie blindé UrbanWall': 'UrbanWall 装甲フーディ',
    'T-shirt renforcé IronThread': 'IronThread 強化Tシャツ',
    'Blouson de moto SteetHide': 'StreetHide バイカージャケット',
    'Chemise blindée CorpoGuard': 'CorpoGuard 装甲ドレスシャツ',
    'Gilet pare-balles Apex Shield': 'Apex Shield 防弾ベスト',
    'Veste tactique ShadowVest': 'ShadowVest タクティカルジャケット',
    'Pardessus blindé TrenchLine': 'TrenchLine 装甲オーバーコート',
    'Combinaison de course RunShield': 'RunShield レーシングスーツ',
    'Gilet de sécurité WatchGuard': 'WatchGuard セキュリティベスト',
    'Manteau blindé NightShield': 'NightShield 装甲コート',
    'Armure urbaine StreetFort': 'StreetFort アーバンアーマー',
    "Combinaison d'assaut StormSuit": 'StormSuit アサルトスーツ',
    'Cape blindée IronCape': 'IronCape 装甲クローク',
    'Armure corporelle tactique TacForce': 'TacForce タクティカル・ボディアーマー',
    'Armure de combat Vanguard': 'Vanguard コンバットアーマー',
    'Exosquelette léger FrameGuard': 'FrameGuard 軽量エクソスケルトン',
    'Armure anti-émeute RiotMax': 'RiotMax 暴動鎮圧アーマー',
    'Exo-armure lourde Titan': 'Titan 重エクソアーマー',
    'Armure de siège Bulwark': 'Bulwark シージアーマー',
    'Gilet urbain NeoWeave': 'NeoWeave アーバンベスト',
    'Poncho blindé DustRunner': 'DustRunner 装甲ポンチョ',
    'Plastron discret SlimPlate': 'SlimPlate 隠匿型チェストガード',
    'Veste cargo ToughLine': 'ToughLine カーゴジャケット',
    'Bandana blindé StreetWrap': 'StreetWrap 装甲バンダナ',
    'Duster blindé RoadWarden': 'RoadWarden 装甲ダスターコート',
    'Blouson de vol ArmorWing': 'ArmorWing フライトジャケット',
    'Combinaison ouvrière ForgeSkin': 'ForgeSkin ワーカーカバーオール',
    'Kimono renforcé SilkSteel': 'SilkSteel 強化着物',
    'Parka arctique IceShell': 'IceShell アークティックパーカ',
    'Armure modulaire HexPlate': 'HexPlate モジュラーアーマー',
    'Harnais de combat WarRig': 'WarRig コンバットハーネス',
    'Robe de combat mystico-blindée ArcaneVeil': 'ArcaneVeil 魔術戦闘ローブ',
    "Plastron d'assaut CrashCore": 'CrashCore アサルト・チェストプレート',
    'Armure intégrale BunkerSuit': 'BunkerSuit フルボディアーマー',
    'Carapace de sécurité SentinelShell': 'SentinelShell セキュリティ・カラペイス',
    'Armure de tranchée IronBastion': 'IronBastion トレンチアーマー',
    'Combinaison blindée OgreMail': 'OgreMail 装甲スーツ',
    'Armure de puissance Juggernaut': 'Juggernaut パワーアーマー',
    'Exo-blindage Colossus': 'Colossus エクソプレーティング',
  },

  cyberdeck: {
    'Cyberdeck Ghostline 3700': 'Ghostline 3700 サイバーデッキ',
    'Cyberdeck PixelWave Starter': 'PixelWave Starter サイバーデッキ',
    'Cyberdeck DataForge Mk.I': 'DataForge Mk.I サイバーデッキ',
    'Cyberdeck NovaPulse Runner': 'NovaPulse Runner サイバーデッキ',
    'Cyberdeck GridRunner Eco': 'GridRunner Eco サイバーデッキ',
    'Cyberdeck OmniDyne Pulse': 'OmniDyne Pulse サイバーデッキ',
    'Cyberdeck ShadowByte Mini': 'ShadowByte Mini サイバーデッキ',
    'Cyberdeck TechHive Basic': 'TechHive Basic サイバーデッキ',
    'Cyberdeck Prism Nexus': 'Prism Nexus サイバーデッキ',
    'Cyberdeck Ghostline 9000 Elite': 'Ghostline 9000 Elite サイバーデッキ',
    'Cyberdeck BlackVeil Phantom': 'BlackVeil Phantom サイバーデッキ',
    'Cyberdeck Kurotech Ronin X': 'Kurotech Ronin X サイバーデッキ',
    'Cyberdeck DataForge Mk.III Pro': 'DataForge Mk.III Pro サイバーデッキ',
    'Cyberdeck Meridian Warframe': 'Meridian Warframe サイバーデッキ',
    'Cyberdeck NovaPulse Apex': 'NovaPulse Apex サイバーデッキ',
    'Cyberdeck VortexNet Razor': 'VortexNet Razor サイバーデッキ',
    'Cyberdeck SpectraCorp Sentinel': 'SpectraCorp Sentinel サイバーデッキ',
    'Cyberdeck ZeroDay Exploit': 'ZeroDay Exploit サイバーデッキ',
    'Cyberdeck OmniDyne Titan': 'OmniDyne Titan サイバーデッキ',
    'Cyberdeck ShadowByte Wraith': 'ShadowByte Wraith サイバーデッキ',
    'Cyberdeck StreetSpark Lite': 'StreetSpark Lite サイバーデッキ',
    'Cyberdeck BinaryBudget V2': 'BinaryBudget V2 サイバーデッキ',
    'Cyberdeck NeonFlicker': 'NeonFlicker サイバーデッキ',
    'Cyberdeck RustBucket Mk.II': 'RustBucket Mk.II サイバーデッキ',
    'Cyberdeck WaveRider Compact': 'WaveRider Compact サイバーデッキ',
    'Cyberdeck CipherNode Entry': 'CipherNode Entry サイバーデッキ',
    'Cyberdeck SubNet Crawler': 'SubNet Crawler サイバーデッキ',
    'Cyberdeck HoloJack Slim': 'HoloJack Slim サイバーデッキ',
    'Cyberdeck ProbeLight Scanner': 'ProbeLight Scanner サイバーデッキ',
    'Cyberdeck IronClad Pocket': 'IronClad Pocket サイバーデッキ',
    'Cyberdeck QuantumEdge Sigma': 'QuantumEdge Sigma サイバーデッキ',
    'Cyberdeck NightFall Stealth': 'NightFall Stealth サイバーデッキ',
    'Cyberdeck HyperVault Fortress': 'HyperVault Fortress サイバーデッキ',
    'Cyberdeck StrikeForce Omega': 'StrikeForce Omega サイバーデッキ',
    'Cyberdeck CrystalMind Nexus': 'CrystalMind Nexus サイバーデッキ',
    'Cyberdeck TempestWare Havoc': 'TempestWare Havoc サイバーデッキ',
    'Cyberdeck NebulaCore Prime': 'NebulaCore Prime サイバーデッキ',
    'Cyberdeck VoidRunner Eclipse': 'VoidRunner Eclipse サイバーデッキ',
    'Cyberdeck ArcticByte Glacier': 'ArcticByte Glacier サイバーデッキ',
    'Cyberdeck PhantomLink Ultra': 'PhantomLink Ultra サイバーデッキ',
  },
};

/** The Japanese name for a template, or undefined to fall back to English. */
export function featNameJa(featType: string, name: string): string | undefined {
  return FEAT_NAMES_JA[featType]?.[name];
}
