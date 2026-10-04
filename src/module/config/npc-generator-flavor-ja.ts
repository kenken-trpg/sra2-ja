/**
 * Japanese text for the NPC generator's flavor tables.
 *
 * npc-generator-data.ts carries a French and an English copy of the keyword,
 * behavior and catchphrase tables (KEYWORDS_BY_CATEGORY / _EN, BEHAVIORS /
 * _EN, CATCHPHRASES / _EN), and the generator writes one of them into the
 * created actor. Japanese falls back to the English copy, so these strings
 * used to reach the sheet in English.
 *
 * The entries have no id: their identity is the string itself. Keying on the
 * English text rather than adding a third copy to the upstream table keeps
 * the merge from upstream clean, the same way npc-generator-data-ja.ts keys
 * gear on the French name.
 *
 * A key that no longer matches the table would silently stop working, so
 * npc-generator-flavor-ja.test.ts fails on one.
 */

/** Keyed by category, because the same word means different things per list. */
export const KEYWORDS_JA: Record<string, Record<string, string>> = {
  metatype_status: {
    'Street troll': 'ストリートのトロール',
    'Fallen corpo elf': '落ちぶれた企業エルフ',
    'Ork laborer': 'オークの労働者',
    'Suburban dwarf': '郊外のドワーフ',
    'Average human': '平凡なヒューマン',
    'Aristocrat elf on the run': '逃亡中の貴族エルフ',
    'Barrens ork': 'バレンズのオーク',
    'Circus troll': 'サーカスのトロール',
    'Mountain dwarf': '山岳のドワーフ',
    'Discriminated metahuman': '差別されるメタヒューマン',
    'Street kid': 'ストリートの子供',
    'Gang veteran': 'ギャングの古参',
    'Ex-convict': '元服役囚',
    'Shadow orphan': 'シャドウの孤児',
    'Corporate refugee': '企業からの逃亡者',
    'Political exile': '政治亡命者',
  },
  origin: {
    'Seattle Barrens': 'シアトル・バレンズ',
    'Corporate district': '企業区',
    Nomad: 'ノマド',
    'Hong Kong Plex': '香港プレックス',
    'Free Berlin': '自由ベルリン',
    'São Paulo Favelas': 'サンパウロのファヴェーラ',
    'Neo-Tokyo corpo tower': 'ネオ東京の企業タワー',
    'Tír na nÓg': 'ティル・ナ・ノーグ',
    'Ork Underground': 'オーク・アンダーグラウンド',
    'Free Caribbean': '自由カリブ',
    'Inner Paris': 'パリ市内',
    'Frozen Moscow': '凍てつくモスクワ',
    'Overcrowded Lagos': '過密のラゴス',
    'Chicago Plex': 'シカゴ・プレックス',
    'Pueblo Corporate Council': 'プエブロ企業評議会',
    'Hamburg docks': 'ハンブルクの港湾',
  },
  role: {
    'Chromed samurai': 'クローム漬けのサムライ',
    'Urban shaman': '都市のシャーマン',
    'Freelance decker': 'フリーのデッカー',
    'Hardened mercenary': '歴戦の傭兵',
    'Discreet infiltrator': '物静かなインフィルトレイター',
    'Manipulative face': '人を操るフェイス',
    'Drone rigger': 'ドローン・リガー',
    'Mystic adept': 'ミスティック・アデプト',
    'Lab rat': '実験体',
    'Data thief': 'データ泥棒',
    Bodyguard: 'ボディガード',
    'Shadow courier': 'シャドウの運び屋',
    'Junior fixer': '駆け出しのフィクサー',
    'Street doctor': 'ストリート・ドクター',
    'Ex-corpo agent': '元企業エージェント',
    Smuggler: '密輸業者',
  },
  lifestyle: {
    Squatter: 'スクウォッター',
    Low: '低い生活水準',
    Medium: '並の生活水準',
    Comfortable: '快適な生活水準',
    Luxury: '贅沢な生活水準',
    'On the run': '逃亡中',
    Nomad: 'ノマド',
    Roommate: 'ルームシェア',
    'In hiding': '潜伏中',
    'High-tech homeless': 'ハイテク・ホームレス',
    'Lives in a van': 'バン暮らし',
    'Illegal subtenant': '違法な又借り',
    'Seedy hotel': 'うらぶれたホテル',
    'Coffin motel': '棺桶モーテル',
    'Converted warehouse': '改装した倉庫',
    'Collective squat': '共同スクワット',
  },
  free: {
    'Former military': '軍隊上がり',
    'Obsessive collector': '偏執的なコレクター',
    'Chronic paranoid': '慢性的な被害妄想',
    'Soykaf addict': 'ソイカフ中毒',
    '20th century movie buff': '20世紀映画のマニア',
    'Drone fighting fan': 'ドローン闘技のファン',
    'Frustrated artist': 'くすぶった芸術家',
    'Compulsive gambler': 'ギャンブル依存',
    'BTL addict': 'BTL 中毒',
    'Amateur cook': '素人料理人',
    'Passionate mechanic': '無類のメカ好き',
    'Tarot reader': 'タロット占い',
    'Weekend athlete': '週末アスリート',
    'Ethical hacker': 'ホワイトハッカー',
    'Conspiracy theorist': '陰謀論者',
    'Cat lover': '猫好き',
  },
};

export const BEHAVIORS_JA: Record<string, string> = {
  'Protects innocents even when it compromises the mission':
    '任務を危うくしてでも民間人を守る',
  'Always loyal to the team, never leaves anyone behind':
    'チームに忠実で、仲間を置き去りにしない',
  'Meticulously plans every step before acting': '動く前に手順を細かく計画する',
  'Keeps cool under all circumstances': 'どんな状況でも冷静さを失わない',
  'Always splits the pay fairly': '報酬は必ず公平に分ける',
  'Refuses to kill non-combatants': '非戦闘員は殺さない',
  'Always keeps their word, even to an enemy': '敵が相手でも約束は守る',
  'Takes time to analyze the situation before drawing':
    '銃を抜く前に状況を見極める',
  'Helps other runners in trouble, even without compensation':
    '困っているランナーを、報酬が無くても助ける',
  'Always checks emergency exits when entering a place':
    '建物に入ったら必ず非常口を確認する',
  'Distrusts corpos but stays professional with Johnsons':
    '企業は信用しないが、ジョンソン氏には職業的に接する',
  'Trusts their gut, and they are rarely wrong':
    '直感を信じる。そしてたいてい当たる',
  'Defuses group tensions with humor': '場の緊張をユーモアでほぐす',
  'Keeps their gear in perfect condition': '装備を完璧な状態に保っている',
  'Knows everyone in the neighborhood, and everyone knows them':
    '街の人間を全員知っていて、向こうも彼らを知っている',
  'Refuses to fight before having their morning soykaf':
    '朝のソイカフを飲むまでは戦わない',
  'Cannot resist a bet, even a stupid one': 'くだらない賭けでも断れない',
  'Becomes violent when insulted or when their metatype is insulted':
    '自分やメタタイプを侮辱されると暴力に訴える',
  'Talks too much and sometimes reveals sensitive info':
    '喋りすぎて、たまに機密を漏らす',
  'Spends all their money on useless gadgets':
    '役に立たないガジェットに金を使い果たす',
  'Has a soft spot for lost causes': '勝ち目のない話に肩入れしてしまう',
  'Refuses to use technology when magic can do the job':
    '魔術で足りる場面では技術を使わない',
  'Brags about exploits at the worst moment': '最悪のタイミングで武勇伝を語る',
  'Is incapable of lying convincingly': '嘘が下手で、すぐ見抜かれる',
  'Panics when the plan changes mid-action': '作戦が途中で変わると取り乱す',
  'Trusts strangers too easily': '初対面の相手をすぐ信用する',
  'Argues with the spirits/AIs/drones they control':
    '使役する精霊／AI／ドローンと口論する',
  'Kleptomaniac — steals things without realizing it':
    '盗癖がある — 無意識に物を持ち去る',
  'Obsessed with a rival they want to surpass':
    '追い抜きたいライバルに執着している',
  'Sleeps very badly and compensates with stimulants':
    'ひどい不眠を興奮剤でごまかしている',
  'Quotes obscure proverbs in the middle of combat':
    '戦闘の最中に無名の格言を引用する',
  'Names all their weapons and talks to them':
    '武器すべてに名前を付けて話しかける',
  'Collects trophies from their runs': 'ランから戦利品を持ち帰って集めている',
  'Listens to classical music during firefights':
    '銃撃戦の最中にクラシックを聴く',
  'Draws sketches of people they meet': '出会った人物のスケッチを描く',
  'Keeps an encrypted diary of all their runs':
    '全てのランを暗号化した日記に残している',
  'Meditates 10 minutes before each run, even if the team gets impatient':
    'チームが苛立っても、ランの前に10分瞑想する',
  'Gives everyone ridiculous nicknames': '誰にでもふざけたあだ名を付ける',
  'Lucky charm: has a fetish object they never leave behind':
    '験担ぎ：肌身離さない愛着品がある',
  'Cooks for the team before every mission':
    '任務の前には必ずチームに料理を作る',
};

export const CATCHPHRASES_JA: Record<string, string> = {
  "It's not personal. Well, maybe a little.":
    '私怨じゃない。……まあ、少しはあるかもな。',
  'They told me it would be easy. They lied.':
    '簡単な仕事だと言われた。嘘だったが。',
  "If you can't pay 'em, you can't kill 'em.":
    '金を払えない相手は、殺せない相手だ。',
  "I have a plan. It's not a good plan, but it's a plan.":
    '作戦はある。いい作戦じゃないが、作戦だ。',
  "No problem a good old gun can't solve.": '銃で片付かない問題はない。',
  "Every scar has a story. That one's a long story.":
    '傷にはそれぞれ物語がある。そいつは長い話だ。',
  "We're all gonna die someday. Today's not your day... probably.":
    '誰だっていつかは死ぬ。今日のあんたじゃない……たぶんな。',
  'Welcome to the Shadows, omae. Try not to stay.':
    'シャドウへようこそ、オマエ。長居はするな。',
  'The plan was perfect. Reality screwed up.':
    '作戦は完璧だった。現実の方がしくじった。',
  "I never said it was a good idea. I said it was MY idea.":
    'いい案だとは言ってない。俺の案だと言ったんだ。',
  'When magic blows up in your face, all you can do is run.':
    '魔術が顔の前で暴発したら、走るしかない。',
  'Two rules: no kids, and I get paid upfront.':
    'ルールは二つ。子供は巻き込まない、報酬は前払い。',
  "What's the worst that could happen? No, don't answer that.":
    '最悪で何が起きる？ いや、答えなくていい。',
  "I'm not expensive. Then again, I'm not reliable either.":
    '高くはない。その代わり当てにもならない。',
  'In the Shadows, paranoia is just common sense.':
    'シャドウでは、疑り深さはただの常識だ。',
  "Chummer, you look like someone who's gonna cause me trouble.":
    'チャマー、あんた面倒を持ち込む顔をしてる。',
  "You want professional or cheap? You can't have both.":
    'プロが欲しいのか、安さが欲しいのか。両方は無理だ。',
  "If you can't hear my footsteps, you're already dead.":
    '足音が聞こえないなら、あんたはもう死んでいる。',
  'The Matrix is like real life. Only more dangerous.':
    'マトリックスは現実と同じだ。もっと危ないだけで。',
  'Spirits like me. People are the problem.':
    '精霊には好かれる。問題は人間の方だ。',
  "Omae, when I say it's handled, it's handled. Mostly.":
    'オマエ、片付いたと言ったら片付いてる。だいたいは。',
  'Careful, the last person who underestimated me is... unavailable.':
    '気をつけな。前に俺を甘く見た奴は……今は出てこられない。',
  'Magic is beautiful. Until it fries your brain.':
    '魔術は美しい。脳を焼かれるまではな。',
  "They don't call me that for nothing. Well, kinda for nothing.":
    'その呼び名には理由がある。まあ、ほとんど無いが。',
  "I'm a professional. I miss my targets in a very organized way.":
    '俺はプロだ。外すときも実に整然と外す。',
  'Stealth is my thing. BOOM. Uh... forget that.':
    '隠密は得意だ。ドカン。……今のは忘れろ。',
  "I've seen worse. No, actually, I haven't.":
    'もっとひどいのを見てきた。いや、見てないな。',
  "You smell that? That's the smell of nuyen.":
    'この匂いが分かるか。新円の匂いだ。',
  "One day I'll retire. But not today.": 'いつかは足を洗う。今日じゃないが。',
  'The streets of Seattle taught me everything. Especially how to run fast.':
    'シアトルの路上で全部覚えた。特に、速く逃げる方法を。',
  'Hey, nobody told me there would be a dragon.':
    'おい、ドラゴンが出るとは聞いてないぞ。',
  "Trust me, I'm almost a professional.": '任せろ、ほぼプロだ。',
  "I don't work for free. Unless it's personal.":
    'ただ働きはしない。私怨が絡まない限りはな。',
  'They say chrome makes you cold. Not true, I just have built-in AC.':
    'クロームは体を冷やすと言うが、違う。冷房が内蔵されてるだけだ。',
  "Three seconds. That's all I need.": '三秒。それだけあればいい。',
  "The Sixth World is rotten. But it's home.":
    '第六世界は腐ってる。それでも故郷だ。',
  "If I'm giving you a deal, it's because you have something I want.":
    '俺が値引きするときは、あんたが欲しい物を持ってるときだ。',
  "Johnsons lie. It's in their contract.":
    'ジョンソン氏は嘘をつく。契約に書いてある。',
  'A day without a shootout is a wasted day.':
    '撃ち合いのない日は、無駄な一日だ。',
  "My implants are worth more than your apartment. And they're more reliable.":
    '俺のインプラントはあんたの部屋より高い。そのうえ信頼できる。',
};

export function keywordJa(category: string, en: string): string | undefined {
  return KEYWORDS_JA[category]?.[en];
}

export function behaviorJa(en: string): string | undefined {
  return BEHAVIORS_JA[en];
}

export function catchphraseJa(en: string): string | undefined {
  return CATCHPHRASES_JA[en];
}
