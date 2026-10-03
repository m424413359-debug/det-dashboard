// المحتوى الثابت للتطبيق: الخطة والمكتبة. بيانات المستخدم (التقدم) في app.js وتُحفظ على الجهاز.

const PLAN = [
  {
    id: 'w0', name: 'التجهيز', range: 'أول نافذة أونلاين', startDay: 0, endDay: 0,
    focus: 'اختبار مبدئي وتجهيز عدّة الأوفلاين قبل أي تدريب',
    tasks: [
      { id: 't1', mode: 'on', title: 'اعمل الاختبار التجريبي الرسمي وسجّل علامتك',
        steps: ['افتح englishtest.duolingo.com واختر الاختبار التجريبي المجاني', 'اعمله بهدوء كأنه الامتحان الحقيقي', 'سجّل العلامة في تبويب «دفتري» ← العلامات'] },
      { id: 't2', mode: 'dl', title: 'نزّل عدّة الأوفلاين كاملة',
        steps: ['Anki أو AnkiDroid + قائمة Academic Word List', 'حزمة الإنجليزية والعربية في Google Translate للترجمة بدون نت', 'قاموس إنجليزي–إنجليزي أوفلاين (WordWeb أو GoldenDict)', 'تطبيق بودكاست (AntennaPod) + 10–15 حلقة من 6 Minute English و VOA مع نصوصها', 'Kiwix + ملف Simple English Wikipedia', 'التعرّف على الكلام الإنجليزي أوفلاين في Gboard', 'اطبع القوالب من المكتبة كنسخة ورقية'] }
    ]
  },
  {
    id: 'w1', name: 'الأسبوع 1', range: '3 – 9 أكتوبر', startDay: 0, endDay: 6,
    focus: 'شكل الامتحان، المفردات، والقراءة',
    tasks: [
      { id: 't3', mode: 'off', title: 'تعلّم أنواع الأسئلة والوقت لكل نوع',
        steps: ['اقرأ «شكل الامتحان» في المكتبة', 'Read Aloud و Listen Then Speak انشالوا — لا تتدرب عليهم', 'Interactive Speaking ما فيه وقت تحضير'] },
      { id: 't4', mode: 'off', title: '6 جلسات قراءة: Read and Select و Read and Complete',
        steps: ['من فقرة محمّلة، احذف نصف كل كلمة ثانية، وكمّلها بعد ساعة', '20 كلمة: غيّر حروف في 10 منها، وامتحن نفسك أي وحدة حقيقية', 'انتبه للجمع والزمن والنهايات (-s, -ed, -ly)'] },
      { id: 't5', mode: 'off', title: 'ابدأ دفتر الأخطاء + 20 كلمة أكاديمية يومياً',
        steps: ['كل غلطة: الخطأ ← الصح ← السبب', 'كل كلمة بمعناها بالإنجليزي وجملة من تأليفك', 'ركّز على عائلات الكلمات: analyze, analysis, analytical'] }
    ]
  },
  {
    id: 'w2', name: 'الأسبوع 2', range: '10 – 16 أكتوبر', startDay: 7, endDay: 13,
    focus: 'الاستماع والقراءة التفاعلية',
    tasks: [
      { id: 't6', mode: 'off', title: '6 جلسات Listen and Type (إملاء)',
        steps: ['وقّف بعد كل جملة واكتبها حرفياً، إعادتين كحد أقصى', 'قارن مع النص ولوّن الأخطاء', '15–20 جملة في الجلسة'] },
      { id: 't7', mode: 'off', title: '3 جلسات Interactive Reading',
        steps: ['مقال 300–500 كلمة من Kiwix', 'اكتب عنوان بجملة واحدة', 'حدّد جواب 3 أسئلة بالضبط، ولخّص الفكرة بـ 15 كلمة'] },
      { id: 't7b', mode: 'off', title: 'تلخيص محادثة كاملة (Interactive Listening)',
        steps: ['اسمع حلقة 6 دقائق بدون نص', 'جاوب 3 أسئلة تفاصيل بكلمات قليلة', 'لخّص بـ 3–4 جمل خلال 75 ثانية'] },
      { id: 't8', mode: 'on', title: 'اختبار تجريبي رسمي #2', steps: ['سجّل العلامة وقارنها بالأولى'] }
    ]
  },
  {
    id: 'w3', name: 'الأسبوع 3', range: '17 – 23 أكتوبر', startDay: 14, endDay: 20,
    focus: 'الكتابة والمحادثة — أعلى أثر على العلامة',
    tasks: [
      { id: 't9', mode: 'off', title: '10 ردود كتابية بالمؤقت (5 دقائق)',
        steps: ['اسحب موضوع عشوائي من المكتبة', 'هدفك 120–150 كلمة بالقالب', 'افحص بقائمة الفحص، وانقله لقسم «للتصحيح»'] },
      { id: 't10', mode: 'off', title: '15 تسجيل صوتي واستمع لكل واحد',
        steps: ['Speak About the Photo و Read Then Speak: 60–90 ثانية', 'Interactive Speaking: جاوب فوراً بطريقة ARE خلال 35 ثانية', 'اكتب ملاحظتين بعد كل تسجيل وأعِد مرة'] },
      { id: 't11', mode: 'on', title: 'صحّح دفعة الكتابات مع Claude',
        steps: ['انسخ قسم «للتصحيح» من دفتري', 'اطلب علامة تقريبية وأكثر 3 أخطاء بتتكرر'] }
    ]
  },
  {
    id: 'w4', name: 'الأسبوع 4', range: '24 – 30 أكتوبر', startDay: 21, endDay: 27,
    focus: 'محاكاة كاملة وتجهيز يوم الامتحان',
    tasks: [
      { id: 't12', mode: 'off', title: '3 محاكاة كاملة أوفلاين (60 دقيقة)',
        steps: ['اتبع جدول المحاكاة في المكتبة', 'بدون توقف وبدون قاموس', 'سجّل أضعف جزئين واشتغل عليهم'] },
      { id: 't13', mode: 'on', title: 'اختبار تجريبي رسمي #3 و #4', steps: ['115+ مرتين متتاليتين = جاهز تحجز'] },
      { id: 't14', mode: 'on', title: 'جهّز مكان الامتحان بإنترنت ثابت',
        steps: ['مكان أساسي + بديل', 'جرّب الاختبار التجريبي بنفس المكان والجهاز والوقت', 'اقرأ المتطلبات التقنية الرسمية والكاميرا الثانية', 'لا تحجز قبل ما تتأكد من الاستقرار'] }
    ]
  }
];

const MODES = {
  off: { label: 'أوفلاين', hint: 'بيشتغل بدون إنترنت' },
  on:  { label: 'أونلاين', hint: 'بيحتاج إنترنت — اعمله بنافذة الأونلاين' },
  dl:  { label: 'تحميل', hint: 'نزّله وأنت أونلاين عشان تستخدمه أوفلاين' }
};

const ONLINE_WINDOW = [
  'زامن البودكاست و Anki',
  'اختبار تجريبي رسمي إذا ضايل منه هذا الأسبوع',
  'انسخ قسم «للتصحيح» وصحّحه مع Claude',
  'نزّل أي مادة ناقصة للأسبوع الجاي'
];

const TIMER_BLOCKS = [
  { name: 'مفردات', min: 10, note: 'Anki أو البطاقات الورقية + دفتر الأخطاء' },
  { name: 'مهارة الأسبوع', min: 20, note: 'التمرين المحدد في الخطة' },
  { name: 'إنتاج', min: 20, note: 'كتابة أو كلام بالمؤقت' },
  { name: 'تصحيح وتسجيل', min: 10, note: 'سجّل أخطاءك في دفتري' }
];

const ERROR_KINDS = ['قواعد', 'إملاء', 'مفردات', 'نطق', 'استماع'];

const LIBRARY = [
  {
    id: 'format', title: 'شكل الامتحان',
    blocks: [
      { type: 'p', text: 'ساعة تقريباً، أونلاين من البيت، تكيّفي، والعلامة من 160. النتيجة خلال يومين تقريباً.' },
      { type: 'p', text: 'انشال Read Aloud و Listen Then Speak من يوليو 2025، وانضاف Interactive Speaking (6–8 ردود × 35 ثانية بدون تحضير). Read Then Write انشال من 2024.' },
      { type: 'table', rows: [
        ['Read and Select', 'كلمة حقيقية ولا وهمية؟ لا تخمّن عشوائياً'],
        ['Fill in the Blanks', 'كلمة ناقصة بجملة — انتبه للقواعد'],
        ['Read and Complete', 'حروف ناقصة بفقرة'],
        ['Interactive Reading', 'إكمال، Highlight، فكرة رئيسية، عنوان'],
        ['Listen and Type', 'اكتب الجملة المسموعة حرفياً'],
        ['Interactive Listening', 'اختيار رد + إجابات قصيرة + تلخيص'],
        ['Write About the Photo', 'دقيقة واحدة'],
        ['Interactive Writing', '~5 د + ~3 د متابعة'],
        ['Writing Sample', '~5 دقائق'],
        ['Speak About the Photo', 'حتى 90 ثانية'],
        ['Read, Then Speak', 'تحضير قصير + حتى 90 ثانية'],
        ['Interactive Speaking', '6–8 × 35 ثانية، بدون تحضير'],
        ['Speaking Sample', '1–3 دقائق']
      ] },
      { type: 'note', text: 'الأوقات تقريبية؛ أدق مصدر هو الاختبار التجريبي الرسمي.' }
    ]
  },
  {
    id: 'writing', title: 'قوالب الكتابة',
    blocks: [
      { type: 'h', text: 'Write About the Photo' },
      { type: 'en', text: 'In this picture, [who] [is/are doing what] in [where].\nIn the background, there is [detail], which suggests that [guess].\nIt seems like [feeling].' },
      { type: 'h', text: 'Writing Sample و Interactive Writing' },
      { type: 'en', text: 'In my opinion, ... because ...\nFirstly, ... For example, ...\nMoreover, ... This means that ...\nAdmittedly, some people argue that ... However, ...\nOverall, I believe that ...' },
      { type: 'p', text: 'هدفك 120–150 كلمة. في سؤال المتابعة: جاوب مباشرة، سبب، مثال، ختام — بدون تكرار ردك الأول.' },
      { type: 'h', text: 'قائمة الفحص' },
      { type: 'list', items: ['120+ كلمة', 'موقف واضح بأول جملة', 'مثال محدد واحد على الأقل', '3+ كلمات ربط مختلفة', 'تطابق الفاعل والفعل (He goes, People are)'] },
      { type: 'h', text: 'كلمات بترفع المستوى' },
      { type: 'table', ltr: true, rows: [
        ['good', 'beneficial, valuable, effective'],
        ['bad', 'harmful, detrimental'],
        ['very important', 'crucial, essential, vital'],
        ['a lot of', 'numerous, a significant number of'],
        ['I think', 'I would argue that'],
        ['so', 'therefore, consequently']
      ] },
      { type: 'en', text: 'Not only does X ..., but it also ...\nIf more people ..., society would ...\nAlthough ..., ...\n..., which is why ...' }
    ]
  },
  {
    id: 'speaking', title: 'قوالب المحادثة',
    blocks: [
      { type: 'p', text: 'القاعدة الذهبية: لا تسكت. كلام متواصل بأخطاء بسيطة أحسن من كلام مثالي بتوقفات.' },
      { type: 'h', text: 'طريقة ARE لكل رد' },
      { type: 'list', items: ['Answer — جاوب مباشرة بأول جملة', 'Reason — ليش؟', 'Example — مثال من حياتك'] },
      { type: 'en', text: 'I definitely prefer studying in the morning, because my mind is fresh and there are fewer distractions. For instance, I review my notes right after breakfast, and I remember them much better.' },
      { type: 'h', text: 'وصف صورة أو موضوع (60–90 ثانية)' },
      { type: 'en', text: 'This picture shows ...\nIn the foreground ... In the background ...\nIt looks like ... probably because ...\nThis reminds me of ... / Personally, I ...\nOverall, ...' },
      { type: 'h', text: 'جمل لكسب الوقت بدل السكوت' },
      { type: 'en', text: "That's an interesting question. Let me think...\nWell, there are a few reasons for that.\nWhat I mean is...\nAnother thing I'd like to mention is..." }
    ]
  },
  {
    id: 'reading', title: 'استراتيجيات القراءة والاستماع',
    blocks: [
      { type: 'h', text: 'Read and Complete' },
      { type: 'list', items: ['اقرأ الجملة كاملة أولاً', 'حدد نوع الكلمة: اسم، فعل، صفة', 'انتبه للجمع والزمن والنهايات', 'راجع الإملاء قبل ما تكمل'] },
      { type: 'h', text: 'Interactive Reading' },
      { type: 'list', items: ['Highlight: حدّد الجواب بالضبط، لا أكثر ولا أقل', 'العنوان والفكرة: الفكرة العامة مش تفصيلة', 'إكمال النص: الجملة اللي بتربط اللي قبلها وبعدها'] },
      { type: 'h', text: 'Listen and Type' },
      { type: 'p', text: 'أغلب الأخطاء بالكلمات الصغيرة (a, the, of) والنهايات. بعد ما تكتب اسأل: هل الجملة صح قواعدياً؟' },
      { type: 'h', text: 'تلخيص المحادثة' },
      { type: 'en', text: 'The conversation is about...\nSpeaker A explains that...\nThey conclude that...' }
    ]
  },
  {
    id: 'mock', title: 'جدول المحاكاة الكاملة',
    blocks: [
      { type: 'table', rows: [
        ['0–8', '30 كلمة حقيقية/وهمية + فقرتين Read and Complete'],
        ['8–16', '10 جمل Listen and Type'],
        ['16–28', 'مقال Interactive Reading'],
        ['28–38', 'حلقة صوتية + 3 أسئلة + تلخيص'],
        ['38–40', 'صورتين Write About the Photo'],
        ['40–48', 'Writing Sample 5 د + متابعة 3 د'],
        ['48–52', 'Speak About the Photo + Read Then Speak'],
        ['52–56', '6 أسئلة Interactive Speaking × 35 ث'],
        ['56–60', 'Speaking Sample']
      ] },
      { type: 'note', text: 'العمود الأول بالدقائق. بعدها سجّل أضعف جزئين في دفتري.' }
    ]
  },
  {
    id: 'offline', title: 'عدّة الأوفلاين',
    blocks: [
      { type: 'list', items: ['المفردات: AnkiDroid أو بطاقات ورقية', 'القاموس: WordWeb أو GoldenDict + حزمة Google Translate', 'الاستماع: AntennaPod مع تحميل تلقائي على الواي فاي', 'القراءة: Kiwix + Simple English Wikipedia', 'النطق: الكتابة الصوتية الأوفلاين في Gboard — إذا كتبت كلامك صح فنطقك مفهوم', 'الكتابة: ملاحظات + مؤقت'] },
      { type: 'h', text: 'إذا انقطعت الكهرباء' },
      { type: 'list', items: ['باور بانك وسماعات سلكية', 'نسخة ورقية من القوالب والأسئلة', 'احكِ دقيقة عن موضوع من ورقة، أو اكتب رد على ورق بالساعة'] }
    ]
  }
];

const EXAM_DAY = [
  'مكان أساسي بإنترنت ثابت وغرفة هادئة لحالك',
  'مكان بديل جاهز',
  'جرّبت الاختبار التجريبي بنفس المكان والجهاز والوقت',
  'قرأت المتطلبات التقنية الرسمية (الجهاز، الكاميرا الثانية)',
  'لابتوب موصول بالكهرباء + موبايل مشحون + باور بانك',
  'كابل إنترنت بدل الواي فاي إذا ممكن',
  'أطفأت التحديثات التلقائية، وطلبت من الموجودين ما يحمّلوا شي',
  'هوية سارية مقبولة رسمياً',
  'اخترت أفضل وقت بالنهار للنت والكهرباء'
];

const TOPICS = [
  'Is it better to study alone or in groups?',
  'Should university education be free?',
  'Describe a skill you want to learn and why.',
  'Are smartphones more helpful or harmful for students?',
  'Describe a person who influenced you.',
  'Should students work part-time while studying?',
  'Is online learning as effective as classroom learning?',
  'What makes a good teacher?',
  'Describe a memorable day in your life.',
  'Should governments spend more on technology or on healthcare?',
  'Is it important to learn a second language?',
  'Do social media bring people closer or further apart?',
  'Describe your ideal job.',
  'Should people live in big cities or small towns?',
  'What is the most important invention of the last 100 years?',
  'Are exams a good way to measure students\' ability?',
  'Describe a place you would like to visit.',
  'Should children have homework?',
  'How can people deal with stress?',
  'What role should technology play in education?'
];

const SPEAK_QS = [
  'Tell me about your university and what you study.',
  'What do you usually do on weekends?',
  "What's a challenge you faced recently, and how did you handle it?",
  'Do you prefer reading books or watching videos to learn? Why?',
  'What would you change about your city?',
  'Tell me about a teacher you remember.',
  'What are your plans after graduation?',
  'How do you usually prepare for exams?',
  "What's a useful app or tool you use every day?",
  'If you could study abroad, where would you go?'
];
