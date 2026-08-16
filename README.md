# AI Business Simulator

AI CEOの方針を受けたAI社員がOffice内を移動し、実Business Taskを処理した結果だけが会社状態と財務へ反映される、実践型事業経営シミュレーターです。

Prototypeの会社は教育事業、社員はFounder Agent 1名です。外部AI API、認証、外部DBは使用しません。

## 起動

```bash
npm install
npm run dev
```

production確認:

```bash
npm test
npm run lint
npm run build
npm start
```

GitHubへのPushとVercelへのDeploy手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## 中心となる因果フロー

```text
Business Plan + Scenario + seed
  → Lead Event
  → lead_contact / proposal / sales_followup
  → Funnel Resolution (WON / LOST)
  → Contract
  → service_preparation / service_delivery
  → Founder Agentの実作業完了
  → Service Delivered Event
  → Financial Engine
  → Revenue / Known Profit / Cash
```

Avatarは独立した演出Stateを持ちません。`CompanyState.workers[].position`、`currentTaskId`、Task進捗を直接表示します。

## Architecture

- `src/domain/company`: CompanyState、初期Plan、Selector
- `src/domain/simulation`: 5分固定量子の決定論的Tick、日次/月次集計
- `src/domain/workforce`: AI CEO Priorityを参照するTask選択、移動、Capacity制約
- `src/domain/tasks`: 因果的Task生成、依存関係、完了Effect
- `src/domain/sales`: seed付きLead schedule、Lead Pipeline、Contract
- `src/domain/finance`: Delivery Event起点の売上認識、固定/変動費、損益分岐
- `src/domain/management`: StrategyとRule-Based CEO。Scenario/Financeを直接変更しない
- `src/components`: Live OfficeとPlan / Finance / Products / Resources / Compare / Roadmap
- `src/store`: Zustand Storeとschema version付きlocalStorage persistence
- `src/tests`: Simulation境界、再現性、Pause/Speed/Capacity、Storage復元

## 時間モデル

- Micro: 09:00–18:00、22営業日/月、5分固定Tick
- Macro: Month単位のRevenue / Cost / Cash / Capacity / Backlog集計
- 1x / 2x / 4xは投入する仮想分数だけを変えます。Engine内部のTick幅は変わらないため、同じ仮想時刻の結果は一致します。
- PauseはEngineへ状態をそのまま返すため、Clock / Worker / Task / Financeの全てが停止します。

## BusinessとAI-Companyから採用した設計資産

BusinessからはBusiness Config、Source Metadata、未設定値を0としないPartial Model、Founder Capacity、決定論的財務、Break-even、Scenario比較を参考にしました。

AI-CompanyからはSimulation Clock、速度制御、Office Zone、Avatar、Task選択、移動、状態→判断→行動→更新のLoopを参考にしました。ランダム案件収益、Revenue Potential、Game Over、難易度、大量の初期社員は移植していません。

## Prototypeで未実装

- 外部LLMを使うAI CEO / Worker（現在はRule-Based）
- 社員採用UIと複数Worker間Meeting
- 複数Business Unit
- Product Launchが市場へ与える効果
- Plan vs Actual入力、外部実績連携
- 外部DB、Authentication、銀行/会計API

これらを追加しても、Scenario = Environment、AI CEO = Decision Maker、Worker = Execution、Financial Engine = Deterministic Calculationという境界を維持する前提です。
