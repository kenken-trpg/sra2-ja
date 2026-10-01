/**
 * Japanese descriptions for the NPC generator's gear templates.
 *
 * The companion of npc-generator-data-ja.ts, split off because the
 * descriptions are an order of magnitude larger than the names and reviewing
 * them in the same file would be impractical. The key is the same: the
 * upstream French `name`, nested under featType, for the reasons set out in
 * that file's header.
 *
 * Every value carries the same <p> markup as the source description. The
 * generator writes it straight into the item's description field, which
 * Foundry renders as HTML, so a dropped or unbalanced tag would be visible on
 * the sheet. npc-generator-descs-ja.test.ts checks the tag sequence of every
 * entry against the upstream description it replaces.
 *
 * A template with no entry here falls back to English, exactly as before.
 */

export const FEAT_DESCS_JA: Record<string, Record<string, string>> = {
  armor: {
    'Veste synthécuir renforcée': '<p>控えめな弾道インサートを仕込んだ合成皮革のジャケット。</p>',
    'Hoodie blindé UrbanWall': '<p>弾道繊維の裏地を備えたフーディ。</p>',
    'T-shirt renforcé IronThread': '<p>パラアラミド繊維製のTシャツ。軽量で目立たない。</p>',
    'Blouson de moto SteetHide': '<p>肘にプロテクターを備えた複合皮革のバイカージャケット。</p>',
    'Chemise blindée CorpoGuard': '<p>弾道繊維を織り込んだ上品なドレスシャツ。企業との会談に最適。</p>',
    'Gilet pare-balles Apex Shield': '<p>衣服の下に着込む軽量の防弾ベスト。</p>',
    'Veste tactique ShadowVest': '<p>着脱可能なセラミックプレートを備えた黒のタクティカルジャケット。</p>',
    'Pardessus blindé TrenchLine': '<p>弾道裏地と強化された襟を備えたロングコート。</p>',
    'Combinaison de course RunShield': '<p>関節部にプロテクターを内蔵したスポーツスーツ。</p>',
    'Gilet de sécurité WatchGuard': '<p>レベル III の弾道プレートを備えた民間警備用ベスト。</p>',
    'Manteau blindé NightShield': '<p>セラミックプレートを内蔵したロングコート。スタイルと防護を兼ね備える。</p>',
    'Armure urbaine StreetFort': '<p>交換可能なプレートを備えたモジュール式のアーバンアーマー一式。</p>',
    "Combinaison d'assaut StormSuit": '<p>敵性環境での作戦用に強化されたスーツ。</p>',
    'Cape blindée IronCape': '<p>弾道防護を備えた複合繊維製のロングクローク。</p>',
    'Armure corporelle tactique TacForce': '<p>軍用級のフル・ボディアーマー。目立たないどころではない。</p>',
    'Armure de combat Vanguard': '<p>弾道防護と対破片防護を備えたフル・コンバットアーマー。</p>',
    'Exosquelette léger FrameGuard': '<p>装甲プレートを統合した部分的なエクソスケルトン。</p>',
    'Armure anti-émeute RiotMax': '<p>強化バイザーを備えた重装の暴動鎮圧アーマー。</p>',
    'Exo-armure lourde Titan': '<p>部分的なエクソスケルトンを備えた重装甲。企業の特殊部隊が使用する。</p>',
    'Armure de siège Bulwark': '<p>正面突撃と制圧のために設計された超重装甲。</p>',
    'Gilet urbain NeoWeave': '<p>軽量な NeoWeave 繊維のベスト。バレンズでの日常に最適。</p>',
    'Poncho blindé DustRunner': '<p>再生ケブラーの裏地を備えたゆったりしたポンチョ。ノマドに人気。</p>',
    'Plastron discret SlimPlate': '<p>シャツの下に着込む極薄のチェストガード。ほぼ探知されない。</p>',
    'Veste cargo ToughLine': '<p>肩と胴を補強した頑丈なカーゴジャケット。</p>',
    'Bandana blindé StreetWrap': '<p>首と顔の下半分を覆う弾道繊維のバンダナ。</p>',
    'Duster blindé RoadWarden': '<p>裏地に軽量プレートを縫い込んだロードコート。</p>',
    'Blouson de vol ArmorWing': '<p>腕と背にセラミック補強を備えたパイロットジャケット。</p>',
    'Combinaison ouvrière ForgeSkin': '<p>弾道補強を統合した難燃性の作業用カバーオール。</p>',
    'Kimono renforcé SilkSteel': '<p>合成スパイダーシルク製の伝統的な着物。刃物に強い。</p>',
    'Parka arctique IceShell': '<p>装甲を内蔵した断熱パーカ。寒冷地作戦用に設計された。</p>',
    'Armure modulaire HexPlate': '<p>複合セラミックの六角プレートで構成された装甲。任務ごとに再構成できる。</p>',
    'Harnais de combat WarRig': '<p>着脱可能な装甲プレートと装備取付点を備えた重装タクティカルハーネス。</p>',
    'Robe de combat mystico-blindée ArcaneVeil': '<p>弾道繊維とマナ伝導フィラメントを織り込んだロングローブ。</p>',
    "Plastron d'assaut CrashCore": '<p>衝撃吸収機構を内蔵した大型の軽合金チェストプレート。</p>',
    'Armure intégrale BunkerSuit': '<p>自立式の空気濾過システムを備えた密閉式フル・ボディアーマー。</p>',
    'Carapace de sécurité SentinelShell': '<p>メガコープの精鋭警備兵が用いる硬質カラパス。</p>',
    'Armure de tranchée IronBastion': '<p>強化されたすね当てと喉当てを備えた重装の陣地防御用アーマー。</p>',
    'Combinaison blindée OgreMail': '<p>トロールの中世装甲に着想を得た、複合素材を重ねた鎖帷子のスーツ。</p>',
    'Armure de puissance Juggernaut': '<p>サーボモーターと強化セラミック装甲を備えた軍用クラスのパワードアーマー。</p>',
    'Exo-blindage Colossus': '<p>エクソスケルトンに搭載する大型の外部装甲。都市の破壊作戦用に設計された。</p>',
  },
  cyberdeck: {
    'Cyberdeck Ghostline 3700': '<p>中級のサイバーデッキ。ファイアウォールと攻撃力のバランスが良い。</p>',
    'Cyberdeck PixelWave Starter': '<p>入門用のサイバーデッキ。初心者デッカーに最適。</p>',
    'Cyberdeck DataForge Mk.I': '<p>頑丈で信頼できるモデル。フリーランサーに人気。</p>',
    'Cyberdeck NovaPulse Runner': '<p>敵性地帯での機動性に最適化された小型サイバーデッキ。</p>',
    'Cyberdeck GridRunner Eco': '<p>直感的なインターフェースと低消費電力を備えた廉価モデル。</p>',
    'Cyberdeck OmniDyne Pulse': '<p>日常的なハッキング作業向けの汎用サイバーデッキ。</p>',
    'Cyberdeck ShadowByte Mini': '<p>市場で最小のサイバーデッキ。ポケットに収まる。</p>',
    'Cyberdeck TechHive Basic': '<p>量産された基本サイバーデッキ。信頼できるが飾りはない。</p>',
    'Cyberdeck Prism Nexus': '<p>強化ファイアウォールと高度な攻撃モジュールを備えた高級サイバーデッキ。</p>',
    'Cyberdeck Ghostline 9000 Elite': '<p>量子プロセッサを統合した Ghostline の上位版。</p>',
    'Cyberdeck BlackVeil Phantom': '<p>企業ネットワークへの不可視侵入のために設計されたステルス・サイバーデッキ。</p>',
    'Cyberdeck Kurotech Ronin X': '<p>最適化されたニューラル・インターフェースを備えた日本製の精密サイバーデッキ。</p>',
    'Cyberdeck DataForge Mk.III Pro': '<p>第三世代の DataForge。攻撃と防御のモジュールが均衡している。</p>',
    'Cyberdeck Meridian Warframe': '<p>民間市場向けに転用された軍用サイバーデッキ。素の性能は比類ない。</p>',
    'Cyberdeck NovaPulse Apex': '<p>マルチコア・プロセッサと能動的熱拡散を備えた NovaPulse の最上位機。</p>',
    'Cyberdeck VortexNet Razor': '<p>専用の総当たりモジュールを備え、攻撃的サイバー戦闘に最適化されている。</p>',
    'Cyberdeck SpectraCorp Sentinel': '<p>多層ファイアウォールと高度な侵入検知を備えた防御型サイバーデッキ。</p>',
    'Cyberdeck ZeroDay Exploit': '<p>ハッカーがハッカーのために設計した。個体ごとに仕様が異なる。</p>',
    'Cyberdeck OmniDyne Titan': '<p>最強の民間サイバーデッキ。軍用機材に匹敵する。</p>',
    'Cyberdeck ShadowByte Wraith': '<p>マトリックス上の痕跡がほぼ探知されない超ステルス・サイバーデッキ。</p>',
    'Cyberdeck StreetSpark Lite': '<p>金のないハッカー向けの超簡素なサイバーデッキ。ソイカフの缶に収まる。</p>',
    'Cyberdeck BinaryBudget V2': '<p>Budget シリーズの第二モデル。相応のファイアウォールを備えた防御寄り。</p>',
    'Cyberdeck NeonFlicker': '<p>ネオン LED を備えた派手なサイバーデッキ。地下クラブで人気。</p>',
    'Cyberdeck RustBucket Mk.II': '<p>錆びて見えるが機能する。廃品から組み上げられた品。</p>',
    'Cyberdeck WaveRider Compact': '<p>マトリックス巡航用の小型サイバーデッキ。軽量で目立たない。</p>',
    'Cyberdeck CipherNode Entry': '<p>暗号化と秘匿性に重点を置いた入門モデル。</p>',
    'Cyberdeck SubNet Crawler': '<p>マトリックスの忘れられた下層網の探索に特化している。</p>',
    'Cyberdeck HoloJack Slim': '<p>没入感のあるハッキング体験のためのホログラフィック・インターフェースを統合。</p>',
    'Cyberdeck ProbeLight Scanner': '<p>戦闘よりもネットワークの偵察と走査に最適化されている。</p>',
    'Cyberdeck IronClad Pocket': '<p>防御作戦向けの堅固なファイアウォールを備えたポケット・サイバーデッキ。</p>',
    'Cyberdeck QuantumEdge Sigma': '<p>マトリックス演算を超高速で行う最新世代の量子プロセッサ。</p>',
    'Cyberdeck NightFall Stealth': '<p>マトリックス上の痕跡が最小限のステルス・サイバーデッキ。侵入に最適。</p>',
    'Cyberdeck HyperVault Fortress': '<p>三重のファイアウォール層と量子隔離を備えたデジタル要塞。</p>',
    'Cyberdeck StrikeForce Omega': '<p>専用の攻撃モジュールを備え、攻撃的サイバー戦闘のために設計された。</p>',
    'Cyberdeck CrystalMind Nexus': '<p>完全に澄んだマトリックス接続を実現する結晶製ニューラル・インターフェース。</p>',
    'Cyberdeck TempestWare Havoc': '<p>敵性プログラムへ自動で反撃する軍用サイバーデッキ。</p>',
    'Cyberdeck NebulaCore Prime': '<p>NebulaCore の最上位機。市場で最強の民間用マトリックス・プロセッサ。</p>',
    'Cyberdeck VoidRunner Eclipse': '<p>マトリックス基盤への深層ダイブに最適化されている。</p>',
    'Cyberdeck ArcticByte Glacier': '<p>極端なオーバークロックを可能にする冷凍式の熱拡散。</p>',
    'Cyberdeck PhantomLink Ultra': '<p>追跡不能な幻影マトリックス接続。プロの選択。</p>',
  },
  awakened: {
    'Éveillé — Perception et Sorcellerie': '<p>このキャラクターは覚醒者である。アストラル界を知覚し、呪文を行使できる。</p>',
    'Éveillé — Perception, Sorcellerie et Conjuration': '<p>このキャラクターは覚醒者である。アストラル知覚、呪術、精霊の召喚を行える。</p>',
    'Éveillé — Projection astrale et Conjuration': '<p>このキャラクターはシャーマンである。アストラル投射と精霊の召喚を行える。</p>',
    'Éveillé — Perception astrale et Adepte': '<p>このキャラクターはフィジカル・アデプトである。マナを自らの肉体に通す。</p>',
  },
  emerged: {
    'Émergé — Persona vivante': '<p>このキャラクターはエマージドである。思考によってマトリックスに接続し、コンプレックス・フォームを編成する。</p>',
  },
};

/** The Japanese description for a template, or undefined to fall back to English. */
export function featDescJa(featType: string, name: string): string | undefined {
  return FEAT_DESCS_JA[featType]?.[name];
}
