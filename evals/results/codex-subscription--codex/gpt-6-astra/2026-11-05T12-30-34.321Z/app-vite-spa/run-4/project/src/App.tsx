import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@gravity-ui/uikit";
import "./styles.css";

type IconName =
  | "home"
  | "book"
  | "bookmark"
  | "sun"
  | "moon"
  | "search"
  | "arrow"
  | "arrow-up"
  | "close"
  | "clock"
  | "leaf"
  | "grid"
  | "check";
function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1z" />
        <path d="M12 5v15" />
      </>
    ),
    bookmark: <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.8 13.2A9 9 0 0 1 10.8 3a9 9 0 1 0 10 10.2Z" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    "arrow-up": <path d="M6 18 18 6M6 6h12v12" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C9 2 2 8 5 15c3 7 15 4 15-12Z" />
        <path d="M3 21 15 9" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

type Article = {
  id: number;
  title: string;
  category: string;
  minutes: number;
  image: string;
  description: string;
  body: string[];
};
const articles: Article[] = [
  {
    id: 1,
    title: "Искусство замедляться",
    category: "Образ жизни",
    minutes: 8,
    image: "forest",
    description:
      "Как находить спокойствие в повседневности и замечать то, что действительно важно.",
    body: [
      "Иногда лучший способ двигаться вперёд — ненадолго остановиться. Прислушаться к шуму деревьев, почувствовать тепло чашки в ладонях, заметить, как свет меняется на стене. Эти маленькие моменты возвращают нас в настоящее.",
      "Медленная жизнь не требует переезда за город или отказа от амбиций. Она начинается с простого вопроса: что заслуживает моего внимания прямо сейчас? Когда мы выбираем одно дело и отдаём ему всё внимание, даже обычное утро становится немного другим.",
      "Попробуйте оставить первые десять минут дня свободными от экрана. Откройте окно, приготовьте любимый напиток, запишите одну мысль. Не стремитесь сделать из этого идеальный ритуал — просто дайте себе немного пространства.",
      "Прогулка без маршрута, обед без спешки, разговор без поглядывания на часы. Спокойствие складывается из небольших решений. Не обязательно менять всё сразу: достаточно выбрать одно из них сегодня.",
    ],
  },
  {
    id: 2,
    title: "Книги, к которым хочется возвращаться",
    category: "Культура",
    minutes: 6,
    image: "library",
    description: "Истории, которые становятся нашими тихими собеседниками.",
    body: [
      "На каждой книжной полке есть особенные книги. Их корешки чуть потёрты, на полях остаются пометки, а между страницами можно найти билет из давней поездки. Мы возвращаемся к ним не только ради сюжета.",
      "При повторном чтении знакомая история звучит иначе. Меняемся мы сами, и вместе с нами меняется то, что мы замечаем в тексте. Второстепенный герой вдруг становится ближе, а пропущенная когда-то фраза оказывается самой важной.",
      "Выберите книгу, которую любили несколько лет назад. Откройте её на любой странице. Иногда для встречи с собой достаточно нескольких знакомых строк.",
    ],
  },
  {
    id: 3,
    title: "Меньше вещей — больше пространства",
    category: "Дизайн",
    minutes: 5,
    image: "interior",
    description:
      "Простой подход к дому, в котором легко дышать и приятно жить.",
    body: [
      "Уют измеряется не количеством предметов. Иногда именно свободный угол, солнечное пятно на полу и удобное кресло делают комнату любимым местом в доме.",
      "Начните с одной поверхности: рабочего стола, подоконника или прикроватной тумбы. Уберите всё, а затем верните только то, чем пользуетесь или что радует вас. У каждой оставшейся вещи появится пространство.",
      "Материалы тоже влияют на ощущение дома. Дерево, лён и керамика красиво стареют и делают повседневные прикосновения приятнее. Не торопитесь покупать новое — присмотритесь к тому, что у вас уже есть.",
    ],
  },
  {
    id: 4,
    title: "Туда, где нет связи",
    category: "Путешествия",
    minutes: 7,
    image: "mountain",
    description: "Небольшое путешествие навстречу большим горам и самому себе.",
    body: [
      "Горы меняют чувство времени. Здесь расстояние измеряется шагами, день — положением солнца, а хорошая новость — ясным небом над перевалом. Телефон постепенно перестаёт быть центром внимания.",
      "Для первого путешествия не нужен сложный маршрут. Выберите знакомую тропу, проверьте погоду, возьмите воду и сообщите близким, куда идёте. Оставьте достаточно времени, чтобы останавливаться и смотреть вокруг.",
      "Самое ценное часто происходит по пути: разговор у костра, вкус простого завтрака, тишина перед рассветом. Именно эти моменты мы увозим с собой, даже если не сделали ни одной фотографии.",
    ],
  },
];
const categories = ["Всё", "Образ жизни", "Культура", "Дизайн", "Путешествия"];
type Page = "overview" | "library" | "favorites";
const pages: { id: Page; label: string; icon: IconName }[] = [
  { id: "overview", label: "Обзор", icon: "home" },
  { id: "library", label: "Библиотека", icon: "book" },
  { id: "favorites", label: "Избранное", icon: "bookmark" },
];
function readStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
function getPage(): Page {
  const hash = window.location.hash.slice(1);
  return hash === "library" || hash === "favorites" ? hash : "overview";
}

export function App() {
  const [page, setPage] = useState<Page>(getPage);
  const [dark, setDark] = useState(() => readStored("tiho-dark", false));
  const [saved, setSaved] = useState<number[]>(() => {
    const value = readStored<unknown>("tiho-saved", [2, 4]);
    return Array.isArray(value)
      ? value.filter((id) => typeof id === "number")
      : [2, 4];
  });
  const [category, setCategory] = useState("Всё");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);
  const [notice, setNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const handler = () => {
      setPage(getPage());
      setCategory("Всё");
      setQuery("");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("tiho-dark", JSON.stringify(dark));
    } catch {}
  }, [dark]);
  useEffect(() => {
    try {
      localStorage.setItem("tiho-saved", JSON.stringify(saved));
    } catch {}
  }, [saved]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2400);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (selected) {
      modalRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      modalRef.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const toggleSave = (article: Article) => {
    const exists = saved.includes(article.id);
    setSaved((previous) =>
      exists
        ? previous.filter((id) => id !== article.id)
        : [...previous, article.id],
    );
    setNotice(
      exists ? "Статья удалена из избранного" : "Статья сохранена в избранное",
    );
  };
  const navigate = (next: Page) => {
    setPage(next);
    setCategory("Всё");
    setQuery("");
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const filtered = articles.filter(
    (article) =>
      (page !== "favorites" || saved.includes(article.id)) &&
      (category === "Всё" || article.category === category) &&
      `${article.title} ${article.description} ${article.category}`
        .toLocaleLowerCase("ru")
        .includes(query.toLocaleLowerCase("ru")),
  );
  const isFiltered = query !== "" || category !== "Всё";
  const visible =
    page === "overview" && !isFiltered ? filtered.slice(1) : filtered;
  const saveButton = (article: Article, className = "") => (
    <button
      className={`save-button ${className} ${saved.includes(article.id) ? "is-saved" : ""}`}
      onClick={() => toggleSave(article)}
      aria-label={
        saved.includes(article.id)
          ? `Удалить из избранного: ${article.title}`
          : `Сохранить: ${article.title}`
      }
      aria-pressed={saved.includes(article.id)}
    >
      <Icon name="bookmark" size={18} filled={saved.includes(article.id)} />
    </button>
  );
  return (
    <ThemeProvider theme={dark ? "dark" : "light"}>
      <div className="app-shell">
        <aside className="sidebar">
          <a
            className="brand"
            href="#overview"
            onClick={() => navigate("overview")}
            aria-label="Тихо — главная"
          >
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>
            тихо<span className="brand-period">.</span>
          </a>
          <div className="sidebar-caption">МЕСТО ДЛЯ ВДОХНОВЕНИЯ</div>
          <nav aria-label="Основная навигация">
            {pages.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => navigate(item.id)}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                aria-current={page === item.id ? "page" : undefined}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.id === "favorites" && (
                  <span className="nav-count">{saved.length}</span>
                )}
                {item.id === "overview" && page === "overview" && (
                  <span className="active-dot" />
                )}
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="quiet-note">
              <span className="note-icon">
                <Icon name="leaf" size={21} />
              </span>
              <p>
                Хорошие мысли
                <br />
                начинаются с паузы.
              </p>
              <span>Побудьте здесь немного.</span>
            </div>
            <div className="theme-label">Ваша атмосфера</div>
            <div
              className="theme-switch"
              role="group"
              aria-label="Тема оформления"
            >
              <button
                className={!dark ? "selected" : ""}
                aria-pressed={!dark}
                onClick={() => setDark(false)}
              >
                <Icon name="sun" size={17} />
                Светлая
              </button>
              <button
                className={dark ? "selected" : ""}
                aria-pressed={dark}
                onClick={() => setDark(true)}
              >
                <Icon name="moon" size={17} />
                Тёмная
              </button>
            </div>
            <div className="sidebar-footer">
              <span className="tiny-brand">тихо.</span>
              <span>Меньше шума. Больше смысла.</span>
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              Ваше пространство<span>/</span>
              <strong>{pages.find((item) => item.id === page)?.label}</strong>
            </div>
            <div className="topbar-right">
              <span className="live-dot" />
              <span>В своём ритме</span>
              <span className="header-divider" />
              <div className="avatar" title="Ваше личное пространство">
                А
              </div>
            </div>
          </header>
          <main>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  {page === "overview"
                    ? "ВДОХНОВЕНИЕ В ПРОСТЫХ ВЕЩАХ"
                    : page === "library"
                      ? "МЫСЛИ, КОТОРЫЕ ОСТАЮТСЯ"
                      : "ВАШЕ ЛИЧНОЕ СОБРАНИЕ"}
                </div>
                <h1>
                  {page === "overview"
                    ? "Время для себя"
                    : page === "library"
                      ? "Библиотека"
                      : "Избранное"}
                  <span>.</span>
                </h1>
                <p>
                  {page === "overview"
                    ? "Идеи, истории и немного тишины в вашем дне."
                    : page === "library"
                      ? "Откройте для себя что-то новое. Без спешки."
                      : "Сохраните то, к чему захочется вернуться."}
                </p>
              </div>
              <label className="search-box">
                <Icon name="search" size={18} />
                <input
                  ref={searchRef}
                  placeholder="Найти вдохновение..."
                  aria-label="Поиск статей"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Очистить поиск"
                  >
                    <Icon name="close" size={16} />
                  </button>
                ) : (
                  <kbd>⌘ K</kbd>
                )}
              </label>
            </div>
            {page === "overview" && !isFiltered && (
              <section className="featured" aria-label="Статья дня">
                <div className="featured-copy">
                  <div className="feature-label">
                    <span />
                    ВЫБОР РЕДАКЦИИ
                  </div>
                  <h2>
                    Искусство
                    <br />
                    замедляться
                  </h2>
                  <p>
                    Как находить спокойствие
                    <br className="desktop-break" /> в повседневности и замечать
                    то,
                    <br className="desktop-break" /> что действительно важно.
                  </p>
                  <div className="feature-meta">
                    <span>Образ жизни</span>
                    <span className="meta-dot">·</span>
                    <span>
                      <Icon name="clock" size={14} />8 минут чтения
                    </span>
                  </div>
                  <div className="feature-actions">
                    <button
                      className="primary-button"
                      onClick={() => setSelected(articles[0])}
                    >
                      Читать историю
                      <Icon name="arrow" size={17} />
                    </button>
                    {saveButton(articles[0])}
                  </div>
                </div>
                <button
                  className="featured-image"
                  onClick={() => setSelected(articles[0])}
                  aria-label="Читать Искусство замедляться"
                >
                  <img
                    src="/images/forest.jpg"
                    alt="Солнечный свет пробивается сквозь зелёный лес"
                  />
                  <span className="image-caption">
                    <span />
                    Вдохните. Выдохните. Вы здесь.
                  </span>
                </button>
              </section>
            )}
            <section
              className="articles-section"
              aria-labelledby="articles-heading"
            >
              <div className="section-heading">
                <div>
                  <h2 id="articles-heading">
                    {query
                      ? "Результаты поиска"
                      : page === "overview"
                        ? "Для вашего вдохновения"
                        : page === "library"
                          ? "Все истории"
                          : "Сохранённые истории"}
                  </h2>
                  {page !== "overview" && (
                    <span className="article-count">{filtered.length}</span>
                  )}
                </div>
                {page === "overview" && (
                  <a
                    href="#library"
                    onClick={() => navigate("library")}
                    className="text-link"
                  >
                    Вся библиотека
                    <Icon name="arrow" size={17} />
                  </a>
                )}
              </div>
              <div className="categories" aria-label="Категории">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={category === item ? "active" : ""}
                    aria-pressed={category === item}
                  >
                    {item === "Всё" && <Icon name="grid" size={14} />} {item}
                  </button>
                ))}
              </div>
              <div className="article-grid">
                {visible.map((article) => (
                  <article className="article-card" key={article.id}>
                    <div className="card-image-wrap">
                      <button
                        className="card-image"
                        onClick={() => setSelected(article)}
                        aria-label={`Читать: ${article.title}`}
                      >
                        <img
                          src={`/images/${article.image}.jpg`}
                          alt={
                            article.image === "library"
                              ? "Высокие книжные полки в старой библиотеке"
                              : article.image === "interior"
                                ? "Светлая гостиная с натуральными материалами"
                                : article.image === "forest"
                                  ? "Солнечный лес"
                                  : "Горные вершины в утреннем тумане"
                          }
                        />
                      </button>
                      {saveButton(article, "card-save")}
                    </div>
                    <div className="card-content">
                      <div className="card-meta">
                        <span className={`category-tag tag-${article.id}`}>
                          {article.category}
                        </span>
                        <span>{article.minutes} мин чтения</span>
                      </div>
                      <button
                        className="card-title"
                        onClick={() => setSelected(article)}
                      >
                        <h3>{article.title}</h3>
                      </button>
                      <p>{article.description}</p>
                      <div className="card-bottom">
                        <span>Редакция Тихо</span>
                        <button
                          aria-label={`Открыть: ${article.title}`}
                          onClick={() => setSelected(article)}
                        >
                          <Icon name="arrow-up" size={19} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {visible.length === 0 && (
                <div className="empty-state">
                  <Icon
                    name={
                      page === "favorites" && !isFiltered
                        ? "bookmark"
                        : "search"
                    }
                    size={32}
                  />
                  <h3>
                    {page === "favorites" && !isFiltered
                      ? "Здесь будет ваше вдохновение"
                      : "Пока ничего не нашлось"}
                  </h3>
                  <p>
                    {page === "favorites" && !isFiltered
                      ? "Нажмите на закладку у понравившейся истории — и она появится здесь."
                      : "Попробуйте другое слово или выберите другую категорию."}
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => {
                      if (page === "favorites" && !isFiltered)
                        navigate("library");
                      else {
                        setQuery("");
                        setCategory("Всё");
                      }
                    }}
                  >
                    {page === "favorites" && !isFiltered
                      ? "Открыть библиотеку"
                      : "Сбросить фильтры"}
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </section>
            <div className="bottom-note">
              <span className="bottom-note-icon">
                <Icon name="sun" size={23} />
              </span>
              <p>
                Не обязательно успевать всё.{" "}
                <span>Иногда достаточно прочитать одну хорошую историю.</span>
              </p>
              <span className="note-spark"><Icon name="leaf" size={22} /></span>
            </div>
            <footer className="main-footer">
              <span>
                © {new Date().getFullYear()} Тихо. Сделано с вниманием.
              </span>
              <span>
                Ваш маленький уголок спокойствия <Icon name="leaf" size={14} />
              </span>
            </footer>
          </main>
        </div>
        {notice && (
          <div className="toast" role="status">
            <Icon name="check" size={17} />
            {notice}
          </div>
        )}
        <dialog
          ref={modalRef}
          className="reader-dialog"
          aria-labelledby="reader-title"
          onCancel={() => setSelected(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          {selected && (
            <>
              <button
                className="reader-close"
                onClick={() => setSelected(null)}
                aria-label="Закрыть статью"
              >
                <Icon name="close" />
              </button>
              <img
                className="reader-image"
                src={`/images/${selected.image}.jpg`}
                alt=""
              />
              <div className="reader-content">
                <div className="reader-meta">
                  <span>
                    {selected.category} · {selected.minutes} минут чтения
                  </span>
                  {saveButton(selected)}
                </div>
                <h2 id="reader-title">{selected.title}</h2>
                <p className="reader-intro">{selected.description}</p>
                {selected.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                <div className="reader-signature">
                  <Icon name="leaf" />С заботой, редакция Тихо
                </div>
              </div>
            </>
          )}
        </dialog>
      </div>
    </ThemeProvider>
  );
}
