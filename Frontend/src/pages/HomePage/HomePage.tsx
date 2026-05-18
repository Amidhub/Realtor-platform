// Главная страница приложения.
// Содержит приветственный блок и базовую поисковую строку по недвижимости.

export function HomePage() {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Недвижимость
        </p>
  
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900">
          Найдите квартиру, дом или коммерческую недвижимость
        </h1>
  
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Студенческий проект web-платформы для размещения и поиска объявлений о продаже и аренде недвижимости.
        </p>
  
        <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Введите город или адрес"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
  
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
            Найти
          </button>
        </div>
      </section>
    )
  }