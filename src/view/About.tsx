import { models, photos } from '../data';
import { lessonFor } from '../data/lessons';
import { DATE_NOTE } from './options';

const families: { title: string; edges: string[] }[] = [
  {
    title: '展馆里能转的几条联系',
    edges: ['R-7谱系 → 东方号、联盟系列', '联盟系列 → 联盟FG、联盟2.1b', '猎鹰九号 → 重型猎鹰（部分技术与芯级衍生）', '长征五号 → 长征五号B（近地轨道构型）'],
  },
  {
    title: 'R-7 的几条分支',
    edges: ['苏联R-7 → 卫星号（卫星运载改装）', '苏联R-7 → 东方／上升（增加或改进上面级）', '东方／上升 → 联盟系列', '苏联R-7 → 闪电系列（多级深空分支）'],
  },
  {
    title: '长征二号这一支',
    edges: ['长征二号 → 二号丙等改进', '长征二号 → 二号E捆绑型', '二号E → 二号F载人型'],
  },
];

export function About() {
  return (
    <div className="learn">
      <section className="panel" aria-labelledby="class-title">
        <h2 id="class-title">看图小课堂</h2>
        <ol className="steps">
          <li>
            <h3>火箭为什么能在太空飞？</h3>
            <p>把气体向后喷出，火箭就得到向前的推力。它不靠空气来推，所以在真空里也能工作。</p>
          </li>
          <li>
            <h3>为什么有些火箭分成好几级？</h3>
            <p>工作完的部分可以分离，剩下的火箭更轻。照片上的涂装线却不一定就是分级线。</p>
          </li>
          <li>
            <h3>飞得高，就一定入轨了吗？</h3>
            <p>不是。入轨还需要足够的水平速度。试飞、亚轨道、成功入轨和一级回收要分开看。</p>
          </li>
          <li>
            <h3>怎样读一张外形照片？</h3>
            <p>先读图注里的具体版本，再认头部、箭身和尾部。塔架、平台和烟雾不是火箭本身。普通照片不能直接当成等比例图。</p>
          </li>
        </ol>
        <svg className="orbit-sketch" viewBox="0 0 700 250" role="img" aria-label="亚轨道与环绕地球的概念示意，不是比例图">
          <circle cx="250" cy="140" r="58" fill="#d9e4f2" stroke="#1d3557" />
          <text x="250" y="145" textAnchor="middle" fontSize="16">地球</text>
          <ellipse cx="250" cy="140" rx="120" ry="88" fill="none" stroke="#1f6feb" strokeWidth="3" />
          <path d="M214 104 Q90 18 212 108" fill="none" stroke="#e4572e" strokeWidth="3" />
          <text x="36" y="36" fontSize="15">亚轨道：升高后返回</text>
          <text x="400" y="78" fontSize="15">轨道：不断绕行</text>
          <text x="36" y="230" fontSize="13" fill="#405066">概念示意，不是工程图，也不表示真实轨迹、速度或大小。</text>
        </svg>
        <p>探索问题：哪两枚火箭顶部差别很大？哪些有侧助推器？为什么飞马座不是从竖直发射台起飞？哪张只是地面模型的照片？</p>
      </section>

      <section className="panel" aria-labelledby="stage-class-title">
        <h2 id="stage-class-title">九型火箭，一段一段认</h2>
        <p>三维展馆里可以短按模型上的一段，或点它的名字。下面是同一套说明：每一段是做什么的，再加上一两件记得住的事。分界对不上公开资料的地方，会直接写“示意”。</p>
        {models.map((model) => {
          const lesson = lessonFor(model.id);
          return (
            <article key={model.id} className="rocket-lesson" data-lesson={model.id}>
              <h3>{lesson.title}</h3>
              <p>{lesson.intro}</p>
              <ul>
                {lesson.facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
              <ul className="edges">
                {lesson.stages.map((stage) => (
                  <li key={stage.id}><strong>{stage.name}。</strong>{stage.blurb}</li>
                ))}
              </ul>
              <p className="muted">{lesson.unclear}</p>
              <p className="links">
                {lesson.sources.map((source) => (
                  <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.title}<small>{source.site}</small></a>
                ))}
              </p>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <h2>沿家族关系继续逛</h2>
        <p>箭头只说明一部分联系，不代表完整设计传承，也不是简单放大。资料目录组与工程家族不总是一一对应。</p>
        {families.map((family) => (
          <div key={family.title}>
            <h3>{family.title}</h3>
            <ul className="edges">
              {family.edges.map((edge) => <li key={edge}>{edge}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2>三维模型从哪里来？</h2>
        <p>本页 9 型全部是公开尺寸加实拍轮廓约束的自主简化重建：土星五号、猎鹰九号卫星罩型、重型猎鹰；长征二号F载人型、长征五号B、长征七号；联盟FG载人型、质子M／微风M商业标准罩、苏联N-1早期外形。未建模型的条目不计入这 9 型。</p>
        <p>曾查阅 NASA 公开的 Saturn V 三维资源（NASA／Michael D. Carbajal），只用于评估资料是否可用。本页没有嵌入那个官方网格，也不把自主模型称为 NASA 原模。</p>
        <p>网格由参数化旋转曲面生成真实的 XYZ 顶点。侧助推器或外侧贮箱、头锥、尾翼和中空喷口都是各自的几何，不是一张照片在转。喷口只帮助认识数量和排列，不能当作制造依据。</p>
        <p>默认使用 WebGL 的透视、光照和深度测试。如果浏览器没有 WebGL，仍用同一组三维顶点做平面投影和三角面排序；极端角度下，这种备用画面可能有局部遮挡误差。模型参数都在页面里，打开时不下载模型文件。</p>
        <p>各型号单独适配窗口，不能当成跨型号的等比例尺。联盟FG采用 ESA 的 49.5 米载人构型口径，质子采用 ILS 的 58.2 米标准商业构型。质子旁边六个结构是一级贮箱，不是可分离的侧助推器。猎鹰九号三维是卫星整流罩，图墙里的载人龙飞船照片不是同一构型。</p>
        <p className="links">
          <a href="https://science.nasa.gov/3d-resources/saturn-v/" target="_blank" rel="noreferrer">NASA 官方三维资源：Saturn V</a>
          <a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noreferrer">NASA 3D Resources 使用说明</a>
        </p>
      </section>

      <section className="panel">
        <h2>关于这个展馆</h2>
        <p>图墙保留 25 个代表展项：美国、中国、苏联／俄罗斯的真实照片。三维区另外使用一张 NASA 的 DART 卫星罩型猎鹰九号实拍，全页合计 26 个独立图片文件。9 个三维重建与照片分开计数。</p>
        <p>图片墙不是 394 枚都已配图。完整目录保留 368 条主库加 26 条实验探空精选、59 个资料目录组。名称、重要构型和历史别名不等于独立设计数。这里的“原型／蓝图”指外形和科普资料，不提供制造工程图。</p>
        <p>截至 2026年11月8日（北京时间）。主库基本字段依据 GCAT 对照，另有独立全文补充的条目会在详情里写明，不表示每一条都完成了独立核验。星舰 Block 3 的近期入轨记录和 HASTE 的轨道用途仍待独立全文复核。HASTE 不作为本馆已确认的轨道成就。长征二号丙的首飞命名口径、智神星一号的目录标签差异，都留在记录说明里。</p>
        <p>没有穷举古代火箭、全部小型探空和气象系列、军事火箭，以及每一种内部批次。未飞的方案不因为宣传而进入已飞统计。苏联历史和今天的俄罗斯分开写。天顶等注明乌克兰制造体系，电子号注明新西兰渊源。V-2 不是美国原创。</p>
        <p>交互只改变当前看的角度和筛选，不保存操作。图上的数字是科普观察定位，不能拿来测量尺寸或推测内部结构。</p>
        <p className="footnote">{DATE_NOTE}</p>
        <p className="links">
          <a href="https://www.planet4589.org/space/gcat/web/launch/index.html" target="_blank" rel="noreferrer">GCAT：记录与覆盖方法</a>
          <a href="https://www.nasa.gov/soundingrockets/" target="_blank" rel="noreferrer">NASA：火箭与探空科学</a>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
          <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>
          <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA 2.0</a>
        </p>
      </section>

      <section className="panel" aria-labelledby="credit-title">
        <h2 id="credit-title">26 张照片的署名和许可</h2>
        <p>公有领域、CC0、CC BY、CC BY-SA 同时存在。不能把所有图片都说成同一种许可，网站代码的许可也不代替图片许可。下面每一张都保留作者、许可和原文件页。</p>
        <ul className="credits">
          {photos.map((photo) => (
            <li key={photo.id}>
              <strong>{photo.title}</strong>
              <span>{photo.credit} · {photo.license}</span>
              <span>{photo.cap}</span>
              <a href={photo.filePage} target="_blank" rel="noreferrer">{photo.file}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
