export type LessonLink = { title: string; href: string; site: string };

export type LessonStage = {
  id: string;
  name: string;
  blurb: string;
  /** Body band in meters from the tail. Omitted for nozzles, boosters, fins. */
  y0?: number;
  y1?: number;
};

export type RocketLesson = {
  id: string;
  title: string;
  intro: string;
  facts: string[];
  /** Shown when a public source does not fix a boundary on this simplified mesh. */
  unclear: string;
  sources: LessonLink[];
  stages: LessonStage[];
};

const disclaimer = '这是按公开资料做的简化科普模型，不是官方工程模型。';

export const lessons: RocketLesson[] = [
  {
    id: 'saturnv',
    title: '土星五号 · 阿波罗构型',
    intro: `${disclaimer}这一型是三级的阿波罗样子，不是后来发射天空实验室的两级型。`,
    facts: [
      'NASA学生资料：土星五号高111米，把航天员送往月球。1969年阿波罗11号的航天员登上了月球。',
      '第一级五台发动机，第二级五台，第三级一台。模型只把最下面的五个喷口画了出来。',
    ],
    unclear: '第一级和第二级一样粗，模型只用一圈深色提醒分界，那不是工厂里的真实接缝。',
    sources: [
      {
        title: 'NASA学生资料：111米与三级任务',
        href: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-saturn-v-grades-5-8/',
        site: 'NASA',
      },
      {
        title: 'NASA：阿波罗11号的三级点火',
        href: 'https://www.nasa.gov/centers-and-facilities/kennedy/50-years-ago-apollo-astronauts-land-take-first-steps-on-moon/',
        site: 'NASA',
      },
      {
        title: 'NASA历史表：各级高度与发动机数量',
        href: 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/02_Saturn_Launch_Vehicles_pp8-14.pdf',
        site: 'NASA',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '第一级喷口',
        blurb: '最下面五个大喷口是第一级的。NASA记载第一级有五台F-1发动机。第二级五台、第三级一台都在更上面，这个模型没有画出来。',
      },
      {
        id: 's1',
        name: '第一级',
        y0: 0,
        y1: 42,
        blurb: '第一级负责把加满燃料的整枚火箭抬离地面。NASA历史表写它高138英尺（大约42米），直径和上面的第二级一样，都是33英尺。模型在接近这个高度的地方换了一圈颜色，用来认级，不是真实接缝。',
      },
      {
        id: 's2',
        name: '第二级',
        y0: 42,
        y1: 65,
        blurb: '第一级分离后，第二级接着推。它有五台发动机，燃料是液氢和液氧。因为它和第一级一样粗，不能只靠胖瘦来认，要看这一段的名字。',
      },
      {
        id: 's3',
        name: '第三级',
        y0: 65,
        y1: 86,
        blurb: '第三级更细。它先把阿波罗飞船送进环绕地球的轨道，再点一次火，推向月球。模型没有画出它那一台发动机。',
      },
      {
        id: 'ship',
        name: '阿波罗飞船',
        y0: 86,
        y1: 101,
        blurb: '这一段是阿波罗飞船的外形。指令舱、服务舱和登月舱都在上面，模型收成一个简化轮廓，看不到里面。',
      },
      {
        id: 'tower',
        name: '顶部尖塔',
        y0: 101,
        y1: 120,
        blurb: '尖顶上更细的一截，对应飞船上方的逃逸塔外形：紧急时帮助飞船离开火箭。引用的NASA学生页没有单列它的高度，所以这里不写米数。',
      },
    ],
  },
  {
    id: 'falcon9',
    title: '猎鹰九号 · 卫星整流罩',
    intro: `${disclaimer}这里是卫星整流罩构型，不是载人龙飞船。`,
    facts: [
      'SpaceX：高70米，直径3.7米。第一级九台梅林发动机，第二级一台真空梅林发动机。',
      '标准整流罩高13.1米、直径5.2米，用来保护卫星，飞一会儿后会打开分离。',
    ],
    unclear: 'SpaceX介绍了连接两级的级间段，但车型页没有给出能对准模型色环的级长，所以两级之间的线是示意。',
    sources: [
      {
        title: 'SpaceX：猎鹰九号高度、发动机与整流罩',
        href: 'https://www.spacex.com/vehicles/falcon-9/',
        site: 'SpaceX',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '第一级喷口',
        blurb: '底部九个喷口是第一级的九台梅林发动机。喷口形状是示意，只帮助数数量。',
      },
      {
        id: 'legs',
        name: '着陆腿',
        blurb: '底部四块小板是收着的着陆腿示意，不是已经张开的支架。SpaceX的车型页没有写出腿的尺寸，所以不写长度。',
      },
      {
        id: 's1',
        name: '第一级',
        y0: 0,
        y1: 44.8,
        blurb: '下面这一大段是第一级。它飞完后可以尝试返回着陆。和上面一级的分界画在深色环附近，是示意，不是公布的精确级长。',
      },
      {
        id: 'grids',
        name: '栅格翼',
        blurb: '四片栅格翼装在第一级上方。返回大气层时，它们转动来帮助火箭调整姿态。',
      },
      {
        id: 's2',
        name: '第二级',
        y0: 44.8,
        y1: 56.9,
        blurb: '第一级分开以后，第二级用一台真空发动机把卫星送进轨道。这台发动机不在火箭最底部，模型没有单独画它的喷口。',
      },
      {
        id: 'fairing',
        name: '整流罩',
        y0: 56.9,
        y1: 80,
        blurb: '头顶比箭体更宽的是整流罩，卫星躲在里面。SpaceX写标准罩高13.1米、直径5.2米。大约飞行3分钟后罩会分离。',
      },
    ],
  },
  {
    id: 'heavy',
    title: '重型猎鹰 · 三芯级',
    intro: `${disclaimer}中间一枚顶上有整流罩，左右是两枚侧助推器。`,
    facts: [
      'SpaceX：高70米、宽12.2米。三个芯级、一共27台梅林发动机，起飞时一起工作。',
      '第二级只有一台真空发动机。标准整流罩和猎鹰九号一样，高13.1米、直径5.2米。',
    ],
    unclear: '侧助推器在模型上的长短是外形示意。连接两枚侧芯级的短杆也只画了大概位置。',
    sources: [
      {
        title: 'SpaceX：三芯级与27台发动机',
        href: 'https://www.spacex.com/vehicles/falcon-heavy/',
        site: 'SpaceX',
      },
      {
        title: 'SpaceX：芯级直径与整流罩',
        href: 'https://www.spacex.com/vehicles/falcon-9/',
        site: 'SpaceX',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '中间喷口',
        blurb: '正中间底部的九个喷口属于中央芯级。',
      },
      {
        id: 'booster-engines',
        name: '两侧喷口',
        blurb: '左右助推器底部也都有喷口。两边的再加上中间九个，就是SpaceX写的27台一级发动机。',
      },
      {
        id: 'boosters',
        name: '侧助推器',
        blurb: '左右两枚是侧助推器。它们的头顶是尖头锥，没有卫星整流罩。点中任意一枚，两枚会一起亮，因为它们是一对。',
      },
      {
        id: 'links',
        name: '连接件',
        blurb: '中间和两侧之间的短杆表示它们连在一起。SpaceX说侧芯级在头锥、级间段和发动机架附近与中央芯级相连。模型只画了粗略的杆，不是真实结构。',
      },
      {
        id: 's1',
        name: '中央第一级',
        y0: 0,
        y1: 44.8,
        blurb: '中央芯级的下段是第一级的一部分，上面还接着第二级。色环分界是示意，车型页没有给出精确级长。',
      },
      {
        id: 'grids',
        name: '中央栅格翼',
        blurb: '中央芯级上画了四片栅格翼。SpaceX写三个芯级各有四片，一共12片。两侧的栅格翼没有单独切出来，点侧助推器时跟着那一整枚亮。',
      },
      {
        id: 'legs',
        name: '中央着陆腿',
        blurb: '中央底部的小板是收着的着陆腿示意。侧助推器底部的小板算在助推器上，点助推器时会一起亮。',
      },
      {
        id: 's2',
        name: '第二级',
        y0: 44.8,
        y1: 56.9,
        blurb: '只有中央芯级上面还有第二级。它用一台真空发动机把载荷送进轨道，喷口不在最底部。',
      },
      {
        id: 'fairing',
        name: '整流罩',
        y0: 56.9,
        y1: 80,
        blurb: '只有中间顶部有整流罩，保护载荷。SpaceX写它高13.1米、直径5.2米。两边助推器没有这顶“帽子”。',
      },
    ],
  },
  {
    id: 'cz2f',
    title: '长征二号F · 载人构型',
    intro: `${disclaimer}这是带逃逸塔、用来发射神舟飞船的样子。`,
    facts: [
      '2003年10月15日，长征二号F把杨利伟送上太空。神舟飞船是它顶上的乘客。',
      '载人航天官网：全长58.34米，芯一级长约21米，芯二级长约15.4米，四枚助推器直径2.25米、长约16.1米，逃逸塔高约8米。',
    ],
    unclear: '整流罩有多长，引用的页面没有单独写出，所以它和逃逸塔相接的位置是示意。助推器发动机的台数，同一页没有写成“每枚几台”。',
    sources: [
      {
        title: '中国载人航天：长二F分级长度',
        href: 'https://www.cmse.gov.cn/kpjy/htzs/ttsj/201509/t20150911_37314.html',
        site: '中国载人航天',
      },
      {
        title: '国家航天局：捆绑四枚助推器、发射神舟',
        href: 'https://www.cnsa.gov.cn/n6758824/n6759008/n6759011/c6794041/content.html',
        site: 'CNSA',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '芯一级喷口',
        blurb: '中央底部四个喷口是芯一级的。官网写一级发动机由4台发动机并联在一起。',
      },
      {
        id: 'booster-engines',
        name: '助推器喷口',
        blurb: '每枚助推器底部的喷口表示那里有发动机。官网列出了助推器发动机，但没有在同一段写明每枚是几台，所以不要把模型上的一个喷口当成官方台数。',
      },
      {
        id: 'boosters',
        name: '助推器',
        blurb: '旁边四枚较短的是助推器，长约16.1米，直径2.25米。它们和芯级一起把火箭送离地面。点中一枚，四枚会一起亮。',
      },
      {
        id: 's1',
        name: '芯一级',
        y0: 0,
        y1: 21,
        blurb: '中央下面这一段是芯一级，官网写长约21米，直径3.35米。',
      },
      {
        id: 's2',
        name: '芯二级',
        y0: 21,
        y1: 36.4,
        blurb: '再往上约15.4米是芯二级。它自己的发动机在这一级的底部，被下面挡住了，模型没有单独画出来。',
      },
      {
        id: 'fairing',
        name: '整流罩',
        y0: 36.4,
        y1: 50.34,
        blurb: '变宽的这一段是整流罩，神舟飞船在里面。官网写整流罩最大直径3.8米。罩的长度这几页没有单独给出，分界是示意。',
      },
      {
        id: 'tower',
        name: '逃逸塔',
        y0: 50.34,
        y1: 70,
        blurb: '最顶上细长的是逃逸塔，高约8米。火箭如果发生危险，它帮助航天员离开。',
      },
    ],
  },
  {
    id: 'cz5b',
    title: '长征五号B · 空间站舱段',
    intro: `${disclaimer}它是“一级半”：芯一级加四枚助推器，没有芯二级。`,
    facts: [
      '载人航天官网：全长约53.7米，芯级直径5米，四枚助推器直径3.35米。整流罩长20.5米、直径5.2米，用来装空间站舱段。',
      '助推器一共8台液氧煤油发动机，芯一级2台氢氧发动机。助推器模块的公开介绍里写高27.7米；模型这一段是按照片缩短的示意，不要在屏幕上量。',
    ],
    unclear: '模型里的助推器比公开介绍的27.7米短，头锥和喷口形状也是示意。',
    sources: [
      {
        title: '中国载人航天：一级半、整流罩20.5米',
        href: 'https://www.cmse.gov.cn/fxrw/czwhbyzhj/zhxw/202005/t20200505_46470.html',
        site: '中国载人航天',
      },
      {
        title: '中国载人航天：8台加2台发动机',
        href: 'https://www.cmse.gov.cn/kpjy/htzs/ttsj/202005/t20200515_46594.html',
        site: '中国载人航天',
      },
      {
        title: '中国载人航天：助推器模块约27.7米',
        href: 'https://www.cmse.gov.cn/fxrw/czwhbyzhj/zhxw/202005/t20200520_46645.html',
        site: '中国载人航天',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '芯一级喷口',
        blurb: '中央底部两个喷口是芯一级的。官网写这一级有2台氢氧发动机。五号B没有芯二级，所以不会再往上点一次芯级发动机。',
      },
      {
        id: 'booster-engines',
        name: '助推器喷口',
        blurb: '四枚助推器一共8台液氧煤油发动机，所以每枚下面画了两个喷口。',
      },
      {
        id: 'boosters',
        name: '助推器',
        blurb: '旁边四枚是助推器，直径3.35米。公开介绍写助推器模块高27.7米。这个模型画得略短，只帮助认出“有四枚”，不能当尺子。点中一枚，四枚一起亮。',
      },
      {
        id: 's1',
        name: '芯一级',
        y0: 0,
        y1: 33.2,
        blurb: '中央粗箭体是芯一级，直径5米。五号B把芯二级取消了，舱段由这一级直接送入轨道。',
      },
      {
        id: 'fairing',
        name: '整流罩',
        y0: 33.2,
        y1: 60,
        blurb: '上面很长的一段是整流罩，长20.5米、直径5.2米。空间站舱段在罩子里面，罩子本身不是舱段。',
      },
    ],
  },
  {
    id: 'cz7',
    title: '长征七号 · 两级捆绑',
    intro: `${disclaimer}它是货运飞船的火箭，官方叫“二级半”，不是长征二号F。`,
    facts: [
      '国家航天局：总长53.1米，芯级直径3.35米，捆绑4枚直径2.25米的助推器。',
      '载人航天官网：芯二级有4台液氧煤油发动机；每枚助推器1台。单个助推器模块高约27米。2017年它发射了天舟一号。',
    ],
    unclear: '芯一级和芯二级在模型上的分界、以及整流罩的长度，引用的官网页没有给出能对准的米数，所以这两条线是示意。芯一级画了两个喷口，和常见公开介绍一致，但上面这两份官网页没有把“两台”写进同一段。',
    sources: [
      {
        title: '国家航天局：53.1米与四枚助推器',
        href: 'https://www.cnsa.gov.cn/n6758968/n6758973/c6771604/content.html',
        site: 'CNSA',
      },
      {
        title: '中国载人航天：二级半与天舟',
        href: 'https://www.cmse.gov.cn/fxrw/czwhbyzhj/zhxw/202005/t20200505_46470.html',
        site: '中国载人航天',
      },
      {
        title: '中国载人航天：助推器约27米、芯二级4台',
        href: 'https://www.cmse.gov.cn/kpjy/htzs/ttsj/201509/t20150911_37325.html',
        site: '中国载人航天',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '芯一级喷口',
        blurb: '中央底部画了两个喷口，表示芯一级的发动机。引用的官网页明确写了芯二级是4台、每枚助推器是1台，没有在同一段写芯一级是几台，所以不要把“两个”当成那一页的原句。',
      },
      {
        id: 'booster-engines',
        name: '助推器喷口',
        blurb: '每枚助推器底部一个喷口。官网写每个助推器由一台液氧煤油发动机推动。',
      },
      {
        id: 'boosters',
        name: '助推器',
        blurb: '四枚助推器直径2.25米，模块高约27米，比长征二号F的助推器更长。点中一枚，四枚一起亮。',
      },
      {
        id: 's1',
        name: '芯一级',
        y0: 0,
        y1: 29,
        blurb: '中央下段是芯一级。它和芯二级之间的这条线是模型上的示意，不是公布的精确级长。',
      },
      {
        id: 's2',
        name: '芯二级',
        y0: 29,
        y1: 40,
        blurb: '芯二级在芯一级上面。官网写它有4台液氧煤油发动机，模型没有把这四台画出来。',
      },
      {
        id: 'fairing',
        name: '整流罩',
        y0: 40,
        y1: 60,
        blurb: '顶部变宽的一段是整流罩，里面可以放天舟货运飞船。引用的官网页没有写出罩长，这一段的轮廓是按照片估计的。',
      },
    ],
  },
  {
    id: 'soyuzfg',
    title: '联盟FG · 载人构型',
    intro: `${disclaimer}总高采用ESA的49.5米。分级米数来自公开型号汇编，和49.5米不是同一张图纸。`,
    facts: [
      'ESA：联盟FG运载火箭高49.5米、最大包络直径10.3米，用来把联盟飞船送往空间站。飞船和火箭同名，不是同一个东西。',
      '公开汇编：四枚助推器高19.6米、直径2.68米；中间芯级高27.1米、直径2.95米；上面还有高6.7米的第三级。',
    ],
    unclear: '另有资料把整箭写成大约51米。模型选定ESA的49.5米，助推器和芯级的米数用来认外形，不能把两份资料当成同一张工程图。每枚助推器和芯级在汇编里各是1台发动机；模型上的多个喷口只是外形示意。',
    sources: [
      {
        title: 'ESA：载人FG总高49.5米',
        href: 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/PromISSe/Facts_about_the_Soyuz',
        site: 'ESA',
      },
      {
        title: '公开型号汇编：助推器、芯级与第三级',
        href: 'https://en.wikipedia.org/wiki/Soyuz-FG',
        site: 'Wikipedia',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '芯级喷口',
        blurb: '中间底部的喷口属于芯级。在俄罗斯的叫法里，芯级是第二级，旁边四枚助推器才是第一级。汇编写芯级是1台发动机。模型画了多个喷口，不要把喷口个数当成发动机台数。',
      },
      {
        id: 'booster-engines',
        name: '助推器喷口',
        blurb: '助推器底部也能看到喷口。汇编写每枚助推器是1台发动机。模型上的多个喷口是外形示意。',
      },
      {
        id: 'boosters',
        name: '助推器',
        blurb: '四枚侧助推器是第一级，高19.6米，越往上越细。它们先工作、先分离。点中一枚，四枚一起亮。',
      },
      {
        id: 'fins',
        name: '尾翼',
        blurb: '底部四片尾翼是简化外形，方便从各个方向认出尾部。不要用它们量尺寸。',
      },
      {
        id: 's2',
        name: '芯级',
        y0: 0,
        y1: 27.1,
        blurb: '中间这根长箭体是第二级，汇编写高27.1米、直径2.95米。它比助推器工作得更久。',
      },
      {
        id: 's3',
        name: '第三级',
        y0: 27.1,
        y1: 33.8,
        blurb: '芯级上面较短的一截是第三级，汇编写高6.7米。它的发动机不在整枚火箭的最底部。',
      },
      {
        id: 'ship',
        name: '联盟飞船',
        y0: 33.8,
        y1: 42.3,
        blurb: '联盟飞船在保护罩里。ESA写飞船长7米。模型把轨道舱、返回舱和服务舱收成一个外形。',
      },
      {
        id: 'tower',
        name: '顶部尖塔',
        y0: 42.3,
        y1: 55,
        blurb: '尖顶是逃逸系统的外形示意。ESA这一页没有给出逃逸塔的高度，所以不写米数。',
      },
    ],
  },
  {
    id: 'proton',
    title: '质子M／微风M',
    intro: `${disclaimer}旁边六块是第一级的燃料箱，不是会单独飞走的助推器。`,
    facts: [
      'ILS：带直径4.1米的标准商业整流罩时，全长58.2米。第一级六台发动机，第二级四台，第三级一台主发动机，上面还有可多次点火的微风M。',
      '六个外侧贮箱围着中间的氧化剂箱。飞行中它们不和中心箱分开，所以不要叫成联盟那样的侧助推器。',
    ],
    unclear: '手册这一节没有给出能对准模型的各级米数。第三级和微风M在模型里合成一段。整流罩有13米和15米两种长度，模型的收尖没有精确对上其中一种。',
    sources: [
      {
        title: 'ILS：58.2米与各级发动机',
        href: 'https://www.ilslaunch.com/launch-vehicle/proton-breeze-m/',
        site: 'ILS',
      },
      {
        title: 'ILS手册：六只外侧燃料箱并不分离',
        href: 'https://www.ilslaunch.com/wp-content/uploads/pdf/PMPG%20Section%20A.pdf',
        site: 'ILS',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '第一级喷口',
        blurb: '六个喷口是第一级的六台发动机。每只外侧燃料箱底部一台。',
      },
      {
        id: 'tanks',
        name: '外侧贮箱',
        blurb: '这六只是燃料箱，围在中间氧化剂箱外面。它们看起来像助推器，但第一级飞行时不分开。点中一只，六只会一起亮。包含外侧贮箱时，第一级最宽处的包络是7.4米。',
      },
      {
        id: 's1',
        name: '第一级芯箱',
        y0: 0,
        y1: 21.2,
        blurb: '中间圆柱的下段表示第一级的中心贮箱。芯箱直径4.1米。模型上的分界没有官方级长可以对准，是示意。',
      },
      {
        id: 's2',
        name: '第二级',
        y0: 21.2,
        y1: 38.2,
        blurb: '再往上这一段代表第二级。ILS写它有四台发动机，模型没有画出来。这条分界同样是示意。',
      },
      {
        id: 'upper',
        name: '第三级和微风M',
        y0: 38.2,
        y1: 52.2,
        blurb: '第三级和微风M上面级在模型里画成一段，因为公开页没有给出能把它们切开的位置。第三级有一台主发动机。微风M高2.65米，还可以多次点火，把卫星送到更高的轨道。',
      },
      {
        id: 'fairing',
        name: '整流罩',
        y0: 52.2,
        y1: 70,
        blurb: '顶部收尖的是整流罩。ILS写标准商业罩直径4.1米，长度有13米和15米两种。模型的收尖没有精确对上其中一种，所以不把这条线说成罩长。',
      },
    ],
  },
  {
    id: 'n1',
    title: '苏联N-1 · 早期外形',
    intro: `${disclaimer}它是苏联为载人登月研制的巨型火箭。四次试飞都没有成功，模型不代表它飞成了。`,
    facts: [
      '公开记录：1969年到1972年四次发射全部失败，没有一次进入轨道。旁边的照片是1967年的地面全尺寸模型，不是升空的飞行箭。',
      '第一级有30台发动机。第二级8台、第三级4台。那些上面的喷口，模型没有画。全高大约105米，也有105.3米的说法。',
    ],
    unclear: '第一级以上，公开来源没有给出能在这个简化外形上分开第二级和第三级的分界，所以合成一段。底部直径按大约17米来画，不精确到厘米。',
    sources: [
      {
        title: 'NASA出版史料：全高约105米，第一级约30米、30台发动机',
        href: 'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4110-vol4.pdf',
        site: 'NASA',
      },
      {
        title: '公开记录：四次失败、30／8／4台发动机',
        href: 'https://en.wikipedia.org/wiki/N1_(rocket)',
        site: 'Wikipedia',
      },
    ],
    stages: [
      {
        id: 'engines',
        name: '第一级喷口',
        blurb: '底部这一圈30个喷口都是第一级的。可以转到下面，和土星五号的五个大喷口比一比：一个是很多小喷口，一个是五个大喷口。',
      },
      {
        id: 's1',
        name: '第一级',
        y0: 0,
        y1: 30,
        blurb: '最下面逐渐变宽的一段是第一级。NASA出版的回忆录里说，整箭大约105米，第一级大约占30米。它要先把后面的火箭抬起来。',
      },
      {
        id: 'upper',
        name: '上面两级',
        y0: 30,
        y1: 75,
        blurb: '中间继续变细的这一大段里还有第二级和第三级。公开资料写它们分别有8台和4台发动机，模型没有画喷口，也没有把两级切开，避免猜一条不存在的分界。',
      },
      {
        id: 'payload',
        name: '顶部包络',
        y0: 75,
        y1: 120,
        blurb: '顶部是准备登月的那一套飞船的外形包络，模型把它收成一个整体，没有拆开里面的舱。四次真火箭都没有把这一段送进轨道。',
      },
    ],
  },
];

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function lessonFor(id: string): RocketLesson {
  const lesson = byId.get(id);
  if (!lesson) throw new Error(`missing lesson ${id}`);
  return lesson;
}

/** Which body band contains this tail-relative height. */
export function bodyPartAt(modelId: string, y: number): string {
  const bands = lessonFor(modelId).stages.filter((stage) => stage.y0 != null && stage.y1 != null);
  for (const band of bands) {
    if (y >= (band.y0 as number) && y < (band.y1 as number)) return band.id;
  }
  return bands[bands.length - 1]?.id || 'body';
}
