import { Bot, Box, GraduationCap, Plus } from "lucide-react";
import type { CompanyState } from "@/domain/company/types";
import { formatCurrency } from "@/lib/format";

export function ProductsView({ state, onAddTask }: { state: CompanyState; onAddTask: (type: "product_development" | "ai_development") => void }) {
  const product = state.products[0];
  return <main className="business-view"><div className="view-title"><div><span className="eyebrow">PRODUCT SYSTEM</span><h1>Products</h1><p>開発Taskの完了は進捗を増やしますが、売上を直接増やしません。</p></div></div>
    <section className="panel product-hero"><div className="product-icon"><GraduationCap size={30} /></div><div className="product-info"><span className="eyebrow">ACTIVE OFFER</span><h2>{product.name}</h2><p>1契約あたり {product.hoursPerContract}h のFounder提供が必要</p><div><span>PRICE <strong>{formatCurrency(product.price)}</strong></span><span>FUNNEL <strong>{Math.round(product.conversionRate * 100)}%</strong></span><span>DELIVERY <strong>{product.hoursPerContract}h</strong></span></div></div><span className="product-status">VALIDATING</span></section>
    <div className="development-grid"><section className="panel development-card"><Box size={20} /><span className="eyebrow">PRODUCT DEVELOPMENT</span><strong>{product.developmentProgressHours.toFixed(1)}h</strong><p>完了済みの教材・教育プログラム改善作業</p><button onClick={() => onAddTask("product_development")}><Plus size={14} /> 改善Taskを追加</button></section><section className="panel development-card"><Bot size={20} /><span className="eyebrow">AI DEVELOPMENT</span><strong>{product.aiDevelopmentProgressHours.toFixed(1)}h</strong><p>完了済みの教育支援AI開発作業</p><button onClick={() => onAddTask("ai_development")}><Plus size={14} /> AI開発Taskを追加</button></section></div>
    <section className="panel architecture-note"><strong>Revenue boundary</strong><code>Development completed → Product progress</code><code>Service delivered → Revenue recognized</code><p>開発完了だけで売上が増える近道は設けていません。</p></section>
  </main>;
}

