import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Button,
  Checkbox,
  Icon,
  Label,
  Modal,
  Pagination,
  Popup,
  Select,
  Table,
  Text,
  TextInput,
  useThemeValue,
  withTableSelection,
  withTableSorting,
  type TableColumnConfig,
  type TableSortState,
} from "@gravity-ui/uikit";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleQuestion,
  Ellipsis,
  Envelope,
  Magnifier,
  Moon,
  PersonPlus,
  Persons,
  Plus,
  Sliders,
  Sun,
  Xmark,
} from "@gravity-ui/icons";
import {
  createContacts,
  filterAndSort,
  statusNames,
  type Contact,
  type ContactStatus,
} from "./data";
import "./styles.css";

const ContactTable = withTableSorting(withTableSelection<Contact>(Table));
const dateFormat = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
const emptyForm = {
  name: "",
  email: "",
  company: "",
  role: "",
  status: "new" as ContactStatus,
};

export function App({ onToggleTheme }: { onToggleTheme: () => void }) {
  const [contacts, setContacts] = useState(createContacts);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [company, setCompany] = useState("all");
  const [sort, setSort] = useState<TableSortState>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [hidden, setHidden] = useState<string[]>([]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const columnsRef = useRef<HTMLButtonElement>(null);
  const [dialog, setDialog] = useState<"add" | "help" | "notifications" | null>(
    null,
  );
  const [detail, setDetail] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const theme = useThemeValue();
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(id);
  }, [notice]);
  const counts = {
    all: contacts.length,
    active: contacts.filter((c) => c.status === "active").length,
    new: contacts.filter((c) => c.status === "new").length,
    archived: contacts.filter((c) => c.status === "archived").length,
  };
  const filtered = useMemo(
    () =>
      filterAndSort(
        contacts,
        query,
        status !== "all" ? status : tab,
        company,
        sort,
      ),
    [contacts, query, status, tab, company, sort],
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize)),
  );
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const companies = [...new Set(contacts.map((c) => c.company))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
  function resetFilters() {
    setQuery("");
    setStatus("all");
    setCompany("all");
    setTab("all");
    setPage(1);
  }
  function exportCsv() {
    const rows = selected.length
      ? contacts.filter((c) => selected.includes(c.id))
      : filtered;
    const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv =
      "\uFEFF" +
      [
        ["Имя", "Email", "Компания", "Статус", "Должность", "Добавлен"],
        ...rows.map((c) => [
          c.name,
          c.email,
          c.company,
          statusNames[c.status],
          c.role,
          c.created,
        ]),
      ]
        .map((row) => row.map(cell).join(";"))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "folio-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Экспортировано контактов: ${rows.length}`);
  }
  function saveContact(e: FormEvent) {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Укажите имя и корректный email.");
      return;
    }
    if (
      contacts.some(
        (c) => c.email.toLowerCase() === form.email.trim().toLowerCase(),
      )
    ) {
      setError("Контакт с таким email уже существует.");
      return;
    }
    setContacts((prev) => [
      {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || "Без компании",
        role: form.role.trim() || "Не указана",
        id: crypto.randomUUID(),
        domain: form.email.split("@")[1],
        created: new Date().toISOString().slice(0, 10),
        tone: prev.length % 5,
      },
      ...prev,
    ]);
    resetFilters();
    setSort([]);
    setDialog(null);
    setForm(emptyForm);
    setNotice("Контакт добавлен");
  }
  const columns: TableColumnConfig<Contact>[] = [
    {
      id: "name",
      name: "Контакт",
      width: "28%",
      meta: { sort: true },
      className: "contact-column",
      template: (c) => (
        <div className="person-cell">
          <div className={`person-avatar tone-${c.tone}`}>
            {initials(c.name)}
          </div>
          <div className="person-text">
            <span className="contact-name">{c.name}</span>
            <span className="secondary-text">{c.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "company",
      name: "Компания",
      width: "19%",
      meta: { sort: true },
      template: (c) => (
        <div className="company-cell">
          <span className={`company-mark company-${c.domain.split(".")[0]}`}>
            {c.company === "Яндекс" ? (
              "Я"
            ) : c.company === "Т-Банк" ? (
              "т"
            ) : c.company === "Самокат" ? (
              "с"
            ) : c.company === "Авито" ? (
              <span className="avito-mark">
                <i />
                <i />
                <i />
                <i />
              </span>
            ) : c.company === "Сбер" ? (
              "↗"
            ) : c.company === "VK" ? (
              "vk"
            ) : c.company === "Ozon" ? (
              "O"
            ) : (
              c.company[0]
            )}
          </span>
          <span>{c.company}</span>
        </div>
      ),
    },
    {
      id: "status",
      name: "Статус",
      width: "15%",
      meta: { sort: true },
      template: (c) => (
        <Label
          size="s"
          theme={
            c.status === "active"
              ? "success"
              : c.status === "new"
                ? "info"
                : "unknown"
          }
        >
          <span className="status-dot" />
          {statusNames[c.status]}
        </Label>
      ),
    },
    {
      id: "role",
      name: "Должность",
      width: "21%",
      meta: { sort: true },
      template: (c) => <span className="role-text">{c.role}</span>,
    },
    {
      id: "created",
      name: "Добавлен",
      width: "15%",
      meta: { sort: true },
      template: (c) => (
        <span className="date-text">
          {dateFormat.format(new Date(c.created)).replace(" г.", "")}
        </span>
      ),
    },
    {
      id: "actions",
      name: "",
      template: (c) => (
        <Button
          view="flat"
          size="s"
          aria-label={`Открыть контакт ${c.name}`}
          onClick={() => setDetail(c)}
        >
          <Icon data={Ellipsis} size={18} />
        </Button>
      ),
    },
  ];
  const activeFilters = query || status !== "all" || company !== "all";
  return (
    <div className="app">
      <header className="topbar">
        <div className="workspace">
          <div className="brand">
            <span className="brand-symbol">
              <i />
              <i />
              <i />
            </span>
            <span>
              folio<span className="brand-dot">.</span>
            </span>
          </div>
          <span className="top-divider" />
          <span className="workspace-label">Рабочее пространство</span>
          <ChevronRight width={14} height={14} />
          <span className="workspace-name">Моя команда</span>
        </div>
        <div className="topbar-actions">
          <Button
            view="flat"
            onClick={() => setDialog("help")}
            className="help-button"
          >
            <Icon data={CircleQuestion} size={17} />
            Помощь
          </Button>
          <Button
            view="flat"
            aria-label="Уведомления"
            onClick={() => setDialog("notifications")}
          >
            <span className="notification-icon">
              <Icon data={Bell} size={19} />
              <i />
            </span>
          </Button>
          <span className="top-divider" />
          <Button
            view="flat"
            aria-label={
              theme === "light"
                ? "Включить тёмную тему"
                : "Включить светлую тему"
            }
            onClick={onToggleTheme}
          >
            <Icon data={theme === "light" ? Moon : Sun} size={17} />
          </Button>
          <span className="user-avatar" title="Алексей Крылов">
            АК
          </span>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumb">
          <span>Рабочее пространство</span>
          <Icon data={ChevronRight} size={12} />
          <span>Контакты</span>
        </div>
        <div className="page-heading">
          <div>
            <div className="title-line">
              <Text variant="header-1" className="page-title">
                Контакты
              </Text>
              <span className="title-counter">{contacts.length}</span>
            </div>
            <Text variant="body-2" color="secondary">
              Все нужные люди. В одном месте.
            </Text>
          </div>
          <div className="heading-actions">
            <Button view="outlined" size="l" onClick={exportCsv}>
              <Icon data={ArrowDownToLine} size={16} />
              Экспорт
            </Button>
            <Button
              view="action"
              className="primary-button"
              size="l"
              onClick={() => {
                setForm(emptyForm);
                setError("");
                setDialog("add");
              }}
            >
              <Icon data={Plus} size={17} />
              Добавить контакт
            </Button>
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat-icon tone-0">
              <Icon data={Persons} size={20} />
            </div>
            <div>
              <span className="stat-label">Всего контактов</span>
              <div className="stat-value">
                <Text variant="header-1">{counts.all}</Text>
                <span className="stat-trend">
                  <Icon data={ArrowUpRight} size={13} />
                  12 за месяц
                </span>
              </div>
            </div>
            <div className="sparkline sparkline-green">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon tone-1">
              <Icon data={CircleCheck} size={20} />
            </div>
            <div>
              <span className="stat-label">Активные контакты</span>
              <div className="stat-value">
                <Text variant="header-1">{counts.active}</Text>
                <span className="stat-note">
                  {Math.round((counts.active / counts.all) * 100)}% от общего
                  числа
                </span>
              </div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon tone-2">
              <Icon data={PersonPlus} size={20} />
            </div>
            <div>
              <span className="stat-label">Новые контакты</span>
              <div className="stat-value">
                <Text variant="header-1">{counts.new}</Text>
                <span className="stat-note">Ждут знакомства</span>
              </div>
            </div>
          </div>
        </div>
        <section className="contacts-panel" aria-label="База контактов">
          <div
            className="panel-tabs"
            role="tablist"
            aria-label="Категории контактов"
          >
            {[
              { id: "all", name: "Все контакты" },
              { id: "active", name: "Активные" },
              { id: "archived", name: "Архив" },
            ].map((t) => (
              <Button
                key={t.id}
                view="flat"
                className={`panel-tab ${tab === t.id ? "is-active" : ""}`}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setStatus("all");
                  setPage(1);
                }}
              >
                {t.name}
                <span className="tab-count">
                  {counts[t.id as keyof typeof counts]}
                </span>
              </Button>
            ))}
            <div className="saved-label">
              <span />
              Все изменения сохранены
            </div>
          </div>
          <div className="table-toolbar">
            <TextInput
              className="search"
              size="l"
              value={query}
              onUpdate={(v) => {
                setQuery(v);
                setPage(1);
              }}
              placeholder="Поиск по имени, email или компании"
              startContent={<Icon data={Magnifier} size={17} />}
              hasClear
              controlProps={{ "aria-label": "Поиск контактов" }}
            />
            <div className="filters">
              <Select
                size="l"
                value={[status]}
                onUpdate={(v) => {
                  setStatus(v[0]);
                  setPage(1);
                }}
                options={[
                  { value: "all", content: "Все статусы" },
                  ...Object.entries(statusNames)
                    .filter(([k]) => tab === "all" || k === tab)
                    .map(([value, content]) => ({ value, content })),
                ]}
                aria-label="Фильтр по статусу"
              />
              <Select
                size="l"
                value={[company]}
                onUpdate={(v) => {
                  setCompany(v[0]);
                  setPage(1);
                }}
                options={[
                  { value: "all", content: "Все компании" },
                  ...companies.map((c) => ({ value: c, content: c })),
                ]}
                aria-label="Фильтр по компании"
              />
              {activeFilters && (
                <Button
                  view="flat"
                  aria-label="Сбросить фильтры"
                  onClick={resetFilters}
                >
                  <Icon data={Xmark} size={16} />
                </Button>
              )}
              <span className="toolbar-divider" />
              <Button
                ref={columnsRef}
                size="l"
                view="outlined"
                onClick={() => setColumnsOpen(!columnsOpen)}
              >
                <Icon data={Sliders} size={16} />
                <span className="columns-label">Столбцы</span>
              </Button>
            </div>
          </div>
          {selected.length > 0 && (
            <div className="selection-bar">
              <span>
                Выбрано: <strong>{selected.length}</strong>
              </span>
              <Button
                view="flat"
                onClick={() => setSelected(filtered.map((c) => c.id))}
              >
                Выбрать все {filtered.length}
              </Button>
              <div className="selection-actions">
                <Button size="s" view="outlined" onClick={exportCsv}>
                  <Icon data={ArrowDownToLine} size={14} />
                  Экспортировать
                </Button>
                <Button
                  size="s"
                  view="flat"
                  onClick={() => setSelected([])}
                  aria-label="Снять выделение"
                >
                  <Icon data={Xmark} size={16} />
                </Button>
              </div>
            </div>
          )}
          <div className="table-container">
            <ContactTable
              className="contacts-table"
              data={visible}
              columns={columns.filter((c) => !hidden.includes(c.id))}
              width="max"
              verticalAlign="middle"
              getRowDescriptor={(c) => ({ id: c.id })}
              selectedIds={selected}
              onSelectionChange={setSelected}
              sortState={sort}
              disableDataSorting
              onSortStateChange={(v) => {
                setSort(v);
                setPage(1);
              }}
              emptyMessage="Контакты не найдены. Попробуйте изменить условия поиска."
              aria-label="Таблица контактов"
            />
          </div>
          {!filtered.length && (
            <div className="empty-reset">
              <Button view="outlined" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            </div>
          )}
          <div className="table-footer">
            <span className="results-count">
              {filtered.length
                ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)}`
                : "0"}{" "}
              <span>из {filtered.length} контактов</span>
            </span>
            <div className="pagination-controls">
              <span className="page-size-label">На странице</span>
              <Select
                size="m"
                value={[String(pageSize)]}
                onUpdate={(v) => {
                  setPageSize(Number(v[0]));
                  setPage(1);
                }}
                options={[8, 16, 32].map((n) => ({
                  value: String(n),
                  content: String(n),
                }))}
                aria-label="Контактов на странице"
              />
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={filtered.length}
                onUpdate={(p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                }}
                size="m"
                compact
                showPages
              />
            </div>
          </div>
        </section>
        <div className="page-footnote">
          <span>
            <Icon data={CircleCheck} size={14} />
            Ваша база контактов всегда под рукой
          </span>
          <span>
            Создано с вниманием к деталям <span className="little-leaf">✳</span>
          </span>
        </div>
      </main>
      <Popup
        anchorElement={columnsRef.current}
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        placement="bottom-end"
      >
        <div className="column-popup">
          <Text variant="subheader-1">Видимые столбцы</Text>
          {columns
            .filter((c) => !["name", "actions"].includes(c.id))
            .map((c) => (
              <Checkbox
                key={c.id}
                checked={!hidden.includes(c.id)}
                onUpdate={(checked) =>
                  setHidden((prev) =>
                    checked
                      ? prev.filter((id) => id !== c.id)
                      : [...prev, c.id],
                  )
                }
              >
                {String(c.name)}
              </Checkbox>
            ))}
        </div>
      </Popup>
      <Modal
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        aria-label={
          dialog === "add"
            ? "Новый контакт"
            : dialog === "help"
              ? "Помощь"
              : "Уведомления"
        }
      >
        <div className="dialog">
          <div className="dialog-heading">
            <Text variant="header-1">
              {dialog === "add"
                ? "Новый контакт"
                : dialog === "help"
                  ? "Всё начинается с контакта"
                  : "Уведомления"}
            </Text>
            <Button
              view="flat"
              aria-label="Закрыть"
              onClick={() => setDialog(null)}
            >
              <Icon data={Xmark} size={18} />
            </Button>
          </div>
          {dialog === "add" ? (
            <form onSubmit={saveContact} className="contact-form">
              <Text color="secondary">
                Добавьте человека в вашу базу контактов.
              </Text>
              {[
                {
                  key: "name",
                  label: "Имя и фамилия",
                  placeholder: "Анна Смирнова",
                },
                {
                  key: "email",
                  label: "Email",
                  placeholder: "anna@company.ru",
                },
                {
                  key: "company",
                  label: "Компания",
                  placeholder: "Название компании",
                },
                {
                  key: "role",
                  label: "Должность",
                  placeholder: "Продакт-менеджер",
                },
              ].map((f) => (
                <label className="form-field" key={f.key}>
                  <span>
                    {f.label}
                    {["name", "email"].includes(f.key) && (
                      <span className="required-mark"> *</span>
                    )}
                  </span>
                  <TextInput
                    size="l"
                    autoFocus={f.key === "name"}
                    value={form[f.key as "name" | "email" | "company" | "role"]}
                    type={f.key === "email" ? "email" : "text"}
                    placeholder={f.placeholder}
                    onUpdate={(v) =>
                      setForm((prev) => ({ ...prev, [f.key]: v }))
                    }
                    controlProps={{
                      required: ["name", "email"].includes(f.key),
                      "aria-label": f.label,
                    }}
                  />
                </label>
              ))}
              <label className="form-field">
                <span>Статус</span>
                <Select
                  size="l"
                  width="max"
                  value={[form.status]}
                  onUpdate={(v) =>
                    setForm((p) => ({ ...p, status: v[0] as ContactStatus }))
                  }
                  options={Object.entries(statusNames).map(
                    ([value, content]) => ({ value, content }),
                  )}
                />
              </label>
              {error && (
                <div role="alert" className="form-error">
                  {error}
                </div>
              )}
              <div className="dialog-actions">
                <Button
                  size="l"
                  view="outlined"
                  onClick={() => setDialog(null)}
                >
                  Отмена
                </Button>
                <Button
                  size="l"
                  type="submit"
                  view="action"
                  className="primary-button"
                >
                  Добавить контакт
                </Button>
              </div>
            </form>
          ) : dialog === "help" ? (
            <div className="help-content">
              <p>Folio помогает держать нужных людей в одном месте.</p>
              <p>
                Нажмите на заголовок столбца, чтобы изменить сортировку.
                Сочетание Shift + нажатие позволяет сортировать сразу по
                нескольким столбцам.
              </p>
              <p>
                Выбирайте контакты чекбоксами. Выбор сохраняется при переходе
                между страницами. Кнопка «Экспорт» скачивает выбранные контакты
                или все записи с учётом фильтров.
              </p>
              <p>
                Через «Столбцы» можно настроить состав таблицы, а через меню в
                строке — открыть карточку контакта.
              </p>
            </div>
          ) : (
            <div className="notifications-empty">
              <span className="stat-icon tone-0">
                <Icon data={CircleCheck} size={28} />
              </span>
              <Text variant="subheader-2">Вы всё посмотрели</Text>
              <Text color="secondary">Новых уведомлений пока нет.</Text>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        aria-label="Карточка контакта"
      >
        {detail && (
          <div className="dialog">
            <div className="dialog-heading">
              <Text variant="header-1">Карточка контакта</Text>
              <Button
                view="flat"
                onClick={() => setDetail(null)}
                aria-label="Закрыть"
              >
                <Icon data={Xmark} size={18} />
              </Button>
            </div>
            <div className="detail-person">
              <div className={`person-avatar tone-${detail.tone}`}>
                {initials(detail.name)}
              </div>
              <div>
                <Text variant="subheader-3">{detail.name}</Text>
                <div className="secondary-text">{detail.role}</div>
              </div>
            </div>
            <dl className="detail-fields">
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${detail.email}`}>{detail.email}</a>
              </dd>
              <dt>Компания</dt>
              <dd>{detail.company}</dd>
              <dt>Статус</dt>
              <dd>{statusNames[detail.status]}</dd>
              <dt>Добавлен</dt>
              <dd>{dateFormat.format(new Date(detail.created))}</dd>
            </dl>
            <div className="dialog-actions">
              <Button view="outlined" size="l" onClick={() => setDetail(null)}>
                Закрыть
              </Button>
              <Button
                href={`mailto:${detail.email}`}
                className="primary-button"
                view="action"
                size="l"
              >
                <Icon data={Envelope} size={16} />
                Написать письмо
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <Icon data={CircleCheck} size={19} />
          {notice}
          <Button
            view="flat"
            size="s"
            onClick={() => setNotice("")}
            aria-label="Скрыть уведомление"
          >
            <Icon data={Xmark} size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
