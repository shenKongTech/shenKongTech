/* NEXUS AI · 知识数据层
 * 课程 / 论文 / 学习资源
 */


const COURSES = [
  {
    id: 'math',
    title: 'AI 数学与概率基础',
    subtitle: '理解模型背后的语言',
    level: '入门',
    icon: '∑',
    color: '#22d3ee',
    desc: '线性代数、概率与信息论构成了机器学习的底层语法。本课程用直觉与可视化替代繁琐推导，帮你建立能读懂论文的数学底座。',
    outcomes: ['用向量与矩阵描述数据变换', '用贝叶斯思维更新信念', '理解交叉熵为何是分类损失'],
    tags: ['线性代数', '概率', '信息论'],
    domain: '数学基础',
    lessons: [
      {
        id: 'l1',
        title: '线性代数：向量、矩阵与空间',
        sections: [
          { h: '向量：数据的坐标', p: '模型眼中的一切数据都是向量。一张图片是像素张量展开的向量，一句话是词嵌入向量的序列。向量的点积衡量方向相似度，余弦相似度因此成为检索与推荐系统的基础度量。', list: ['点积 = 投影长度 × 模长，刻画两个向量的方向关系', '单位向量点积为 1 表示方向完全一致，为 0 表示正交', '嵌入空间中距离越近，语义越相关'] },
          { h: '矩阵：空间的变换', p: '矩阵乘法是线性变换的复合。神经网络的一层本质上是仿射变换加非线性激活。特征值分解与奇异值分解（SVD）揭示了变换的主方向，PCA 降维正是保留方差最大的若干主方向。', list: ['特征值反映变换在特征方向上的缩放倍数', 'SVD 适用于任意形状矩阵，是推荐系统的经典工具', '低秩近似可以在几乎不损失信息的前提下压缩参数'] }
        ],
        keyPoints: ['向量点积衡量相似度', '矩阵是线性变换，SVD 揭示主方向', 'PCA = 保留最大方差方向']
      },
      {
        id: 'l2',
        title: '概率分布与贝叶斯思维',
        sections: [
          { h: '不确定性是常态', p: '现实数据充满噪声，概率是我们描述不确定性的语言。条件概率 P(A|B) 表示在 B 发生的前提下 A 发生的可能性，它是分类器、语言模型与因果推断共同的起点。', list: ['伯努利分布描述二分类，类别分布描述多分类', '高斯分布由均值与方差决定，是误差建模的默认假设', '独立同分布假设是许多理论分析的出发点'] },
          { h: '贝叶斯：先验与证据', p: '贝叶斯公式把先验知识与新证据结合：后验 ∝ 似然 × 先验。最大似然估计（MLE）寻找让观测数据出现概率最大的参数，而最大后验估计（MAP）额外引入先验，天然带有正则化效果。', list: ['P(A|B) = P(B|A)P(A) / P(B)', 'MLE 最大化似然，MAP 最大化后验', '先验相当于对参数空间的偏好约束'] }
        ],
        keyPoints: ['后验 ∝ 似然 × 先验', 'MLE 只看数据，MAP 兼顾先验', '独立同分布是常见但需要检验的假设']
      },
      {
        id: 'l3',
        title: '信息论：熵、交叉熵与 KL 散度',
        sections: [
          { h: '熵：不确定性的度量', p: '熵衡量一个分布的平均信息量。分布越均匀，不确定性越大，熵越高。语言模型的困惑度（Perplexity）本质上是交叉熵的指数形式，用来衡量模型对下一个 token 的惊讶程度。', list: ['均匀分布熵最大，确定性分布熵为 0', '交叉熵 = 熵 + KL 散度', '最小化交叉熵等价于最小化 KL 散度'] },
          { h: '为什么分类用交叉熵', p: '交叉熵衡量用预测分布 q 去编码真实分布 p 所需的平均比特数。当 q 与 p 完全一致时取得最小值，梯度性质良好，因此成为分类任务的标准损失。', list: ['交叉熵损失对 logits 的梯度形式简洁', 'KL 散度非负且不对称', '标签平滑可以缓解过度自信'] }
        ],
        keyPoints: ['熵衡量不确定性', '交叉熵是分类任务的标准损失', 'KL 散度非负、不对称']
      }
    ]
  },
  {
    id: 'ml',
    title: '机器学习基础',
    subtitle: '从数据中归纳规律',
    level: '入门',
    icon: '⌁',
    color: '#7c5cff',
    desc: '以最小可行理论建立机器学习的全局观：三大范式、损失与优化、泛化与评估。学完后你能判断一个业务问题该用什么方法、如何验证效果。',
    outcomes: ['区分监督、无监督与强化学习', '手推梯度下降的更新过程', '设计可靠的模型评估方案'],
    tags: ['监督学习', '梯度下降', '模型评估'],
    domain: '机器学习',
    lessons: [
      {
        id: 'l1',
        title: '机器学习是什么',
        sections: [
          { h: '从写规则到学规律', p: '传统程序由工程师把规则写死，而机器学习让模型从数据中自动归纳映射关系 f(x) → y。我们不再描述「如何做」，而是提供「例子」，让优化算法去寻找最能解释数据的参数。', list: ['监督学习：数据带标签，学习输入到输出的映射', '无监督学习：无标签，发现聚类、降维与结构', '强化学习：通过与环境交互的奖励信号试错学习'] },
          { h: '学习的本质是优化', p: '模型定义了假设空间，损失函数衡量预测与真实的差距，优化算法在参数空间中寻找让损失最小的点。但训练误差低并不等于模型好，真正的目标是泛化到未见数据。', list: ['数据、模型、优化是机器学习三要素', '训练集用于拟合，验证集用于选择，测试集用于最终评估', '泛化能力才是模型价值的唯一标准'] }
        ],
        keyPoints: ['三大范式：监督 / 无监督 / 强化', '学习 = 假设空间中的损失最小化', '泛化优于训练误差']
      },
      {
        id: 'l2',
        title: '线性回归与梯度下降',
        sections: [
          { h: '最简单的模型', p: '线性回归假设输出是输入的线性组合：ŷ = w·x + b。用均方误差（MSE）衡量偏差时，损失函数是凸的，存在闭式解；但在大规模特征下，迭代式的梯度下降更实用。', list: ['MSE 对大误差惩罚更强，对异常值敏感', '闭式解需要矩阵求逆，复杂度高', '特征归一化能显著改善优化条件'] },
          { h: '沿负梯度下山', p: '梯度指向损失上升最快的方向，因此参数沿负梯度更新：θ ← θ − η∇L。学习率 η 决定步长：太大容易震荡发散，太小则收敛缓慢。小批量随机梯度下降在效率与稳定性之间取得平衡。', list: ['批量 GD 稳定但慢，SGD 快但噪声大', '小批量（mini-batch）是深度学习默认选择', '动量与自适应学习率可加速收敛'] }
        ],
        keyPoints: ['线性回归 + MSE 是优化入门范本', '参数沿负梯度方向更新', '学习率决定收敛质量']
      },
      {
        id: 'l3',
        title: '过拟合、正则化与评估',
        sections: [
          { h: '偏差与方差的拉扯', p: '欠拟合对应高偏差，模型太简单；过拟合对应高方差，模型对训练噪声过于敏感。正则化通过在损失中加入参数惩罚来限制模型复杂度：L1 促使稀疏，L2 平滑收缩。', list: ['L1 产生稀疏解，可用于特征选择', 'L2 让参数整体变小，缓解过拟合', 'Dropout 与早停是深度学习中常用的正则手段'] },
          { h: '如何可信地评估', p: '单次划分的偶然性很大，K 折交叉验证能更稳定地估计泛化性能。当类别极不平衡时，准确率会失真，应关注精确率、召回率、F1 与 AUC 等指标。', list: ['交叉验证减少评估方差', '精确率关注预测为正中有多少是真的', '召回率关注真正的正例有多少被找到'] }
        ],
        keyPoints: ['过拟合 = 高方差，欠拟合 = 高偏差', 'L1 稀疏、L2 收缩', '不平衡数据慎用准确率']
      }
    ]
  },
  {
    id: 'dl',
    title: '深度学习核心',
    subtitle: '神经网络如何学习表征',
    level: '进阶',
    icon: '◈',
    color: '#8b7bff',
    desc: '从反向传播到 Transformer，理解现代深度学习的三大支柱：可微分层堆叠、卷积的归纳偏置、注意力的全局建模。',
    outcomes: ['解释反向传播与梯度流动', '说清 CNN 的权值共享与残差连接', '拆解 Transformer 的注意力机制'],
    tags: ['反向传播', 'CNN', 'Transformer'],
    domain: '深度学习',
    lessons: [
      {
        id: 'l1',
        title: '神经网络与反向传播',
        sections: [
          { h: '从感知机到多层网络', p: '单层感知机只能划分线性可分的空间，堆叠非线性激活函数后，多层网络获得了逼近任意连续函数的能力。激活函数引入非线性，是网络表达力的来源。', list: ['Sigmoid 输出有界但易饱和、梯度消失', 'ReLU 计算简单，缓解梯度消失但存在神经元死亡', '残差与归一化让极深网络可训练'] },
          { h: '误差如何回传', p: '反向传播是链式法则在计算图上的高效实现：前向传播缓存中间结果，反向传播从损失出发逐层计算梯度。自动微分框架让这一过程对开发者透明。', list: ['每个节点只需局部梯度', '计算图使梯度复用成为可能', '梯度消失源于连乘导致的指数衰减'] }
        ],
        keyPoints: ['非线性激活赋予网络表达力', '反向传播 = 计算图上的链式法则', 'ReLU 缓解梯度消失']
      },
      {
        id: 'l2',
        title: '卷积神经网络',
        sections: [
          { h: '为图像而生的归纳偏置', p: '卷积核在图像上滑动，共享同一组权重，这使得网络具备平移等变性并大幅减少参数。局部感受野让浅层捕捉边缘与纹理，深层组合出物体部件与语义。', list: ['权值共享显著降低参数量', '池化扩大感受野并带来一定不变性', '堆叠卷积等价于逐层抽象的特征金字塔'] },
          { h: '更深，然后更好', p: 'ResNet 用残差连接把学习目标变为「学习残差」，使梯度可以跨层直达，解决了深层网络的退化问题。它是现代视觉骨干网络的原型。', list: ['残差连接缓解梯度消失与网络退化', 'BatchNorm 稳定分布、加速训练', '深度可分离卷积降低计算量'] }
        ],
        keyPoints: ['卷积 = 局部连接 + 权值共享', '池化扩大感受野', '残差连接让极深网络可训练']
      },
      {
        id: 'l3',
        title: 'Transformer 架构',
        sections: [
          { h: '注意力即软检索', p: '自注意力让每个 token 根据与其他 token 的相关性加权聚合信息。Query 与 Key 的点积计算相关性，Softmax 归一化为权重，再对 Value 加权求和。相比循环结构，它能并行处理整段序列。', list: ['Q·K 衡量相关性，V 承载内容', '多头注意力在不同子空间捕捉多种关系', '缩放因子 √d 防止点积过大导致梯度饱和'] },
          { h: '没有顺序，就注入顺序', p: '自注意力本身对位置不敏感，因此需要位置编码注入顺序信息。原始 Transformer 使用正弦编码，现代大模型多采用可学习位置嵌入或 RoPE 旋转位置编码。', list: ['编码器-解码器结构适配翻译等序列到序列任务', '残差 + LayerNorm 支撑深层堆叠', '注意力复杂度随序列长度平方增长'] }
        ],
        keyPoints: ['自注意力 = QK 相关性 + V 加权', '多头并行捕捉不同关系', '位置编码注入顺序信息']
      }
    ]
  },
  {
    id: 'llm',
    title: '大语言模型工程',
    subtitle: '从预训练到智能体',
    level: '进阶',
    icon: '✦',
    color: '#a78bfa',
    desc: '系统理解大模型的训练链路与落地方式：预训练、指令微调、对齐、提示工程、检索增强与智能体工作流。',
    outcomes: ['说明预训练与对齐的完整链路', '写出结构化的高质量提示', '设计可评估的 RAG 与智能体流程'],
    tags: ['预训练', '提示工程', 'RAG', 'Agent'],
    domain: '自然语言处理',
    lessons: [
      {
        id: 'l1',
        title: '预训练、微调与对齐',
        sections: [
          { h: '自监督的力量', p: '大模型通过下一词预测从海量文本中学习世界知识与语言规律。Scaling Law 表明，模型能力随参数、数据与算力呈幂律提升，这直接推动了千亿参数时代的到来。', list: ['下一词预测是自监督目标，无需人工标注', '规模扩大带来涌现能力', '数据质量与配比往往比数量更关键'] },
          { h: '从会说话到听话', p: '预训练模型只是「续写机器」，指令微调（SFT）教会它遵循指令，RLHF 则用奖励模型拟合人类偏好，通过强化学习进一步对齐。DPO 等方法简化了这一流程。', list: ['SFT 用高质量示范数据塑造行为', '奖励模型把偏好转化为可优化信号', '对齐需同时关注有用性、诚实性与无害性'] }
        ],
        keyPoints: ['下一词预测 + Scaling Law', 'SFT 教格式，RLHF 对齐偏好', '对齐 = 有用 + 诚实 + 无害']
      },
      {
        id: 'l2',
        title: '提示工程与上下文学习',
        sections: [
          { h: '把任务说清楚', p: '大模型的能力很大程度取决于上下文。清晰的指令应包含角色、目标、输入、约束与输出格式。少样本示例（few-shot）让模型通过上下文学习任务模式，无需更新参数。', list: ['明确输出格式可显著降低解析成本', '示例顺序与质量会影响结果', '把复杂任务拆解为可验证的子步骤'] },
          { h: '让模型先想再答', p: '思维链（Chain-of-Thought）引导模型显式写出推理过程，在数学与多跳推理任务上收益显著。自洽性（Self-Consistency）采样多条推理路径并投票，可进一步提升稳定性。', list: ['CoT 适合多步推理，不适合简单检索', '自洽性以更多计算换取更高准确率', '结构化输出配合校验可构建可靠流水线'] }
        ],
        keyPoints: ['提示 = 角色 + 任务 + 约束 + 格式', 'few-shot 通过上下文学习任务', 'CoT 提升多步推理表现']
      },
      {
        id: 'l3',
        title: 'RAG 与智能体工作流',
        sections: [
          { h: '检索增强生成', p: 'RAG 在生成前先从外部知识库检索相关内容，把证据放入上下文，从而降低幻觉、支持私有知识并保持可追溯。完整流程包括切分、嵌入、召回、重排与生成。', list: ['切分粒度影响召回质量与上下文效率', '向量召回擅长语义，关键词召回擅长精确匹配', '重排模型可显著提升 Top-K 相关性'] },
          { h: '从模型到智能体', p: '智能体在模型之外增加了规划、工具调用与记忆。它把复杂目标分解为步骤，调用搜索、代码执行等工具获取反馈，并根据结果调整计划。可靠性来自约束、验证与可观测性。', list: ['工具调用需要严格的参数校验', '记忆分为短期上下文与长期向量存储', '评估应覆盖任务成功率、成本与延迟'] }
        ],
        keyPoints: ['RAG = 检索 + 重排 + 生成', '智能体 = 规划 + 工具 + 记忆', '可靠性来自验证与可观测性']
      }
    ]
  },
  {
    id: 'cv',
    title: '计算机视觉',
    subtitle: '让机器看懂世界',
    level: '中级',
    icon: '◉',
    color: '#f472b6',
    desc: '从图像表示到检测分割，再到扩散生成与多模态对齐，建立完整的视觉智能知识链。',
    outcomes: ['理解卷积与 ViT 的图像建模差异', '掌握检测与分割的核心指标', '说清扩散模型的生成原理'],
    tags: ['目标检测', '分割', '扩散模型', '多模态'],
    domain: '计算机视觉',
    lessons: [
      {
        id: 'l1',
        title: '图像表示与卷积特征',
        sections: [
          { h: '像素之上', p: '图像是高度 × 宽度 × 通道的三维张量。卷积通过局部感受野提取边缘、纹理与形状，数据增强则在有限数据下提升泛化。', list: ['归一化与标准化是训练稳定的前提', '翻转、裁剪、颜色扰动是常用增强', '浅层特征通用，深层特征语义化'] },
          { h: 'ViT：把图像当句子', p: 'Vision Transformer 把图像切成 patch 序列，用自注意力建模全局依赖。在充足数据下，它超越了卷积的局部归纳偏置，成为多模态模型的标准视觉编码器。', list: ['patch 嵌入等价于视觉 token', '缺少卷积偏置，需要更多数据或强增强', 'CLS token 聚合全局表示'] }
        ],
        keyPoints: ['图像是三维张量', '卷积提取局部特征', 'ViT 用注意力建模全局']
      },
      {
        id: 'l2',
        title: '目标检测与分割',
        sections: [
          { h: '框住目标', p: '目标检测同时回答「是什么」与「在哪里」。两阶段方法先产生候选区域再分类，单阶段方法直接回归框与类别，速度更快。NMS 用于合并重复预测。', list: ['IoU 衡量预测框与真实框的重叠程度', 'mAP 综合不同类别与阈值下的精度', '锚框与无锚框是两类主流设计'] },
          { h: '像素级理解', p: '语义分割给每个像素分类，实例分割还要区分同类个体。U-Net 的跳跃连接把浅层细节与深层语义融合，是医学影像分割的经典架构。', list: ['语义分割不区分个体', '实例分割 = 检测 + 掩码', 'Mask R-CNN 在检测分支上增加掩码头'] }
        ],
        keyPoints: ['检测 = 分类 + 定位', 'IoU / mAP 是核心指标', '分割走向像素级理解']
      },
      {
        id: 'l3',
        title: '扩散模型与生成式视觉',
        sections: [
          { h: '从噪声中雕刻图像', p: '扩散模型定义前向加噪过程，并学习逆向去噪。生成时从纯噪声出发，逐步预测并去除噪声，最终得到清晰图像。条件生成通过文本或类别引导去噪方向。', list: ['DDPM 用 U-Net 预测噪声', '无分类器引导增强条件一致性', '扩散采样慢，蒸馏与少步采样是优化重点'] },
          { h: '文本与图像的对齐', p: 'CLIP 用对比学习把图像与文本映射到同一语义空间，使「用自然语言描述图像」成为可能。它既是零样本分类器，也是文生图模型的条件编码器。', list: ['对比学习拉近配对样本、推远负样本', '零样本迁移依赖语义空间的泛化', '扩散 + CLIP 构成文生图主流范式'] }
        ],
        keyPoints: ['扩散 = 加噪 + 学习去噪', '条件引导控制生成方向', 'CLIP 对齐图文语义空间']
      }
    ]
  },
  {
    id: 'rl',
    title: '强化学习与智能体',
    subtitle: '在试错中学会决策',
    level: '高级',
    icon: '⬢',
    color: '#34d399',
    desc: '理解序贯决策的数学框架与主流算法，并延伸到 RLHF 与自主智能体的工程实践。',
    outcomes: ['形式化马尔可夫决策过程', '解释策略梯度与 PPO', '理解 RLHF 与智能体安全边界'],
    tags: ['MDP', 'PPO', 'RLHF', 'Agent'],
    domain: '强化学习',
    lessons: [
      {
        id: 'l1',
        title: 'MDP 与价值迭代',
        sections: [
          { h: '决策的数学语言', p: '马尔可夫决策过程由状态、动作、转移概率与奖励构成。智能体的目标是最大化累计折扣回报，折扣因子 γ 决定它更看重眼前还是长远。', list: ['马尔可夫性：未来只依赖当前状态', '策略是从状态到动作的映射', '价值函数评估在状态或动作上的长期期望回报'] },
          { h: '贝尔曼的递归之美', p: '贝尔曼方程把长期回报拆解为即时奖励加下一状态价值，使动态规划成为可能。Q-learning 在无模型设定下通过时序差分逐步逼近最优动作价值。', list: ['价值迭代在已知模型时直接求解', 'Q-learning 使用 max 操作离线学习', '探索与利用的平衡是核心难题'] }
        ],
        keyPoints: ['MDP = 状态 + 动作 + 奖励 + 转移', '目标是最大化折扣累计回报', '贝尔曼方程支撑价值迭代']
      },
      {
        id: 'l2',
        title: '策略梯度与 PPO',
        sections: [
          { h: '直接优化策略', p: '策略梯度方法直接对策略参数求梯度，沿提升期望回报的方向更新。引入基线（如价值函数）可显著降低方差，Actor-Critic 正是这一思想的实现。', list: ['Actor 负责选动作，Critic 估计价值', '优势函数衡量动作相对基线的优劣', '高方差是策略梯度的主要挑战'] },
          { h: '稳定地更新', p: 'PPO 用裁剪目标限制新旧策略的比率，避免一次更新幅度过大导致性能崩塌。它以简单稳定的特性成为 RLHF 等大规模应用的首选算法。', list: ['裁剪范围 ε 控制更新保守程度', '重要性采样复用旧策略数据', 'KL 惩罚约束策略漂移'] }
        ],
        keyPoints: ['策略梯度直接优化期望回报', 'Critic 提供基线降低方差', 'PPO 用裁剪保证更新稳定']
      },
      {
        id: 'l3',
        title: '从 RLHF 到自主智能体',
        sections: [
          { h: '对齐的三段式', p: 'RLHF 先做监督微调，再用人类偏好训练奖励模型，最后用强化学习优化策略。它让模型从「会续写」走向「符合人类期望」，但也带来奖励黑客与过度优化风险。', list: ['偏好数据质量决定对齐上限', 'KL 约束防止偏离基础模型太远', 'DPO 直接用偏好对优化，省去显式奖励模型'] },
          { h: '智能体的边界', p: '现代智能体把大模型作为决策核心，配合工具、记忆与规划循环完成长程任务。能力越强，越需要沙箱、权限控制与人工确认等安全边界。', list: ['规划分解降低单步难度', '工具返回结果需要验证与容错', '高风险动作应保留人类审批'] }
        ],
        keyPoints: ['RLHF = SFT + 奖励模型 + RL', '奖励黑客源于目标错配', '智能体需要安全边界']
      }
    ]
  }
];

const PAPERS = [
  { id: 'attention', title: 'Attention Is All You Need', authors: 'Vaswani 等', year: 2017, venue: 'NeurIPS', domain: '深度学习', citations: '120k+', difficulty: '进阶', tags: ['Transformer', '自注意力'], link: 'https://arxiv.org/abs/1706.03762', summary: '提出完全基于注意力机制的 Transformer，摒弃循环与卷积，实现高度并行化的序列建模，成为现代大模型的基石。' },
  { id: 'bert', title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin 等', year: 2019, venue: 'NAACL', domain: '自然语言处理', citations: '90k+', difficulty: '进阶', tags: ['预训练', '双向编码'], link: 'https://arxiv.org/abs/1810.04805', summary: '通过掩码语言建模预训练双向 Transformer 编码器，刷新十一项 NLP 任务，开启「预训练 + 微调」范式。' },
  { id: 'resnet', title: 'Deep Residual Learning for Image Recognition', authors: 'He 等', year: 2016, venue: 'CVPR', domain: '计算机视觉', citations: '200k+', difficulty: '入门', tags: ['残差网络', 'CNN'], link: 'https://arxiv.org/abs/1512.03385', summary: '提出残差学习框架与 152 层 ResNet，解决深层网络退化问题，赢得 ILSVRC 2015 冠军。' },
  { id: 'gpt3', title: 'Language Models are Few-Shot Learners', authors: 'Brown 等', year: 2020, venue: 'NeurIPS', domain: '自然语言处理', citations: '30k+', difficulty: '进阶', tags: ['GPT-3', '上下文学习'], link: 'https://arxiv.org/abs/2005.14165', summary: '1750 亿参数的 GPT-3 展示了上下文学习能力：无需梯度更新，仅靠提示即可完成多种任务。' },
  { id: 'instructgpt', title: 'Training Language Models to Follow Instructions with Human Feedback', authors: 'Ouyang 等', year: 2022, venue: 'NeurIPS', domain: '大语言模型', citations: '12k+', difficulty: '进阶', tags: ['RLHF', '对齐'], link: 'https://arxiv.org/abs/2203.02155', summary: 'InstructGPT 用人类反馈强化学习对齐语言模型，使 13 亿参数模型在人类偏好上优于 1750 亿基线。' },
  { id: 'lora', title: 'LoRA: Low-Rank Adaptation of Large Language Models', authors: 'Hu 等', year: 2022, venue: 'ICLR', domain: '大语言模型', citations: '12k+', difficulty: '中级', tags: ['高效微调', '低秩分解'], link: 'https://arxiv.org/abs/2106.09685', summary: '冻结预训练权重，仅训练低秩分解矩阵，将微调参数量降低数个数量级且几乎不损失效果。' },
  { id: 'clip', title: 'Learning Transferable Visual Models From Natural Language Supervision', authors: 'Radford 等', year: 2021, venue: 'ICML', domain: '多模态', citations: '30k+', difficulty: '中级', tags: ['对比学习', '图文对齐'], link: 'https://arxiv.org/abs/2103.00020', summary: 'CLIP 用 4 亿图文对做对比预训练，实现强大的零样本图像分类与跨模态检索能力。' },
  { id: 'ddpm', title: 'Denoising Diffusion Probabilistic Models', authors: 'Ho 等', year: 2020, venue: 'NeurIPS', domain: '生成式 AI', citations: '15k+', difficulty: '高级', tags: ['扩散模型', '生成'], link: 'https://arxiv.org/abs/2006.11239', summary: '建立扩散模型的前向加噪与反向去噪框架，生成质量超越同期 GAN，开启扩散模型时代。' },
  { id: 'rag', title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', authors: 'Lewis 等', year: 2020, venue: 'NeurIPS', domain: '大语言模型', citations: '8k+', difficulty: '中级', tags: ['RAG', '检索增强'], link: 'https://arxiv.org/abs/2005.11401', summary: '将参数化记忆与外部检索结合，让生成模型在知识密集型任务中引用可追溯的外部证据。' },
  { id: 'cot', title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', authors: 'Wei 等', year: 2022, venue: 'NeurIPS', domain: '大语言模型', citations: '10k+', difficulty: '入门', tags: ['提示工程', '推理'], link: 'https://arxiv.org/abs/2201.11903', summary: '在提示中给出推理步骤示例，显著提升大模型在算术、常识与符号推理任务上的表现。' },
  { id: 'vit', title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', authors: 'Dosovitskiy 等', year: 2021, venue: 'ICLR', domain: '计算机视觉', citations: '50k+', difficulty: '中级', tags: ['ViT', '视觉 Transformer'], link: 'https://arxiv.org/abs/2010.11929', summary: '将图像切分为 patch 序列直接输入 Transformer，在大规模数据上超越卷积网络。' },
  { id: 'alphago', title: 'Mastering the Game of Go with Deep Neural Networks and Tree Search', authors: 'Silver 等', year: 2016, venue: 'Nature', domain: '强化学习', citations: '20k+', difficulty: '高级', tags: ['AlphaGo', '蒙特卡洛树搜索'], link: 'https://www.nature.com/articles/nature16961', summary: '结合深度神经网络与蒙特卡洛树搜索，AlphaGo 首次击败人类职业围棋选手。' }
];

/* 等级锚点：每 10 级一个称号，中间等级所需经验在区间内线性增长 */
const LEVEL_ANCHORS = [
  { level: 0, xp: 0, title: '一窍不通' },
  { level: 10, xp: 2000, title: '初识智能' },
  { level: 20, xp: 5000, title: '浅窥机理' },
  { level: 30, xp: 20000, title: '驾轻就熟' },
  { level: 40, xp: 50000, title: '融会贯通' },
  { level: 50, xp: 100000, title: '炉火纯青' },
  { level: 60, xp: 200000, title: '拓界开新' },
  { level: 70, xp: 300000, title: '神乎其技' },
  { level: 80, xp: 500000, title: '登峰造极' },
  { level: 90, xp: 800000, title: '领域专家' },
  { level: 100, xp: 1000000, title: 'AI宗师' }
];

/* ---------- 学习资源 ---------- */
const LEARNING_RESOURCES = [
  {
    group: '框架与工具', color: '#7c5cff',
    items: [
      { name: 'PyTorch', desc: '动态图深度学习框架，研究与生产部署的主流选择。', link: 'https://pytorch.org/' },
      { name: 'Hugging Face', desc: '预训练模型与数据集社区，Transformers 等核心库的所在地。', link: 'https://huggingface.co/' },
      { name: 'LangChain', desc: 'LLM 应用编排框架，覆盖 RAG、工具调用与智能体。', link: 'https://www.langchain.com/' },
      { name: 'JAX', desc: '函数式数值计算与自动微分库，适合高性能研究。', link: 'https://jax.readthedocs.io/' },
      { name: 'Weights & Biases', desc: '实验跟踪与可视化平台，记录指标、超参与模型版本。', link: 'https://wandb.ai/' }
    ]
  },
  {
    group: '数据集与基准', color: '#22d3ee',
    items: [
      { name: 'ImageNet', desc: '大规模图像分类基准，推动深度视觉发展的经典数据集。', link: 'https://www.image-net.org/' },
      { name: 'MMLU', desc: '覆盖 57 个学科的多任务语言理解基准，评估通用知识。', link: 'https://github.com/hendrycks/test' },
      { name: 'GLUE / SuperGLUE', desc: '自然语言理解标准评测集，涵盖推理与相似度任务。', link: 'https://gluebenchmark.com/' },
      { name: 'COCO', desc: '目标检测、分割与图像描述的大规模标注数据集。', link: 'https://cocodataset.org/' },
      { name: 'Gymnasium', desc: '强化学习环境接口标准，提供经典控制与 Atari 任务。', link: 'https://gymnasium.farama.org/' }
    ]
  },
  {
    group: '课程与教程', color: '#34d399',
    items: [
      { name: 'Hugging Face Course', desc: 'Transformers 原理与微调实战的系统课程。', link: 'https://huggingface.co/learn' },
      { name: 'fast.ai', desc: '自顶向下的深度学习实践课程，强调动手与迁移。', link: 'https://www.fast.ai/' },
      { name: 'DeepLearning.AI', desc: '吴恩达团队的深度学习与大模型系列课程。', link: 'https://www.deeplearning.ai/' },
      { name: 'CS231n', desc: '斯坦福计算机视觉课程，覆盖 CNN 与视觉任务。', link: 'https://cs231n.stanford.edu/' },
      { name: 'Kaggle Learn', desc: '短课与真实数据集练习，快速建立工程手感。', link: 'https://www.kaggle.com/learn' }
    ]
  },
  {
    group: '会议与期刊', color: '#f472b6',
    items: [
      { name: 'NeurIPS', desc: '神经信息处理系统大会，机器学习顶级会议。', link: 'https://neurips.cc/' },
      { name: 'ICML', desc: '国际机器学习大会，收录理论与应用前沿工作。', link: 'https://icml.cc/' },
      { name: 'ICLR', desc: '表征学习国际会议，深度学习方向的重要舞台。', link: 'https://iclr.cc/' },
      { name: 'CVPR', desc: '计算机视觉与模式识别会议，视觉领域旗舰会议。', link: 'https://cvpr.thecvf.com/' },
      { name: 'ACL', desc: '计算语言学协会年会，自然语言处理旗舰会议。', link: 'https://aclweb.org/' }
    ]
  }
];
