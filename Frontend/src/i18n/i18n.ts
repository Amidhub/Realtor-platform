import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ru: {
    translation: {
      common: {
        appName: 'Realtor Platform',
        home: 'Главная',
        catalog: 'Каталог',
        createProperty: 'Создать объявление',
        profile: 'Личный кабинет',
        moderation: 'Модерация',
        login: 'Войти',
        logout: 'Выйти',
        register: 'Регистрация',
        details: 'Подробнее',
        backToCatalog: 'Назад в каталог',
        cancel: 'Отмена',
        loading: 'Загрузка...',
        save: 'Сохранить',
        edit: 'Редактировать',
        delete: 'Удалить',
        close: 'Закрыть',
        refresh: 'Обновить',
      },

      home: {
        badge: 'Платформа недвижимости',
        title: 'Найдите недвижимость для жизни, аренды или инвестиций',
        subtitle:
          'Каталог объявлений с фильтрами, подробными карточками объектов, картой, сообщениями и личным кабинетом пользователя.',

        catalogTag: 'Каталог',
        listingTag: 'Объявление',
        findObject: 'Найти объект',
        publishObject: 'Опубликовать объект',

        openCatalogTitle: 'Открыть каталог',
        openCatalogText:
          'Смотрите активные объявления, фильтруйте по цене, площади, комнатам и типу сделки.',
        createListingTitle: 'Создать объявление',
        createListingText:
          'Добавьте объект, фотографии, инфраструктуру и отправьте объявление на модерацию.',

        viewListingsButton: 'Смотреть объявления',
        publishListingButton: 'Разместить объявление',

        heroCardTitle: 'Удобная работа с объектами',
        heroCardText:
          'Покупатель видит подробную карточку, а владелец может получать сообщения по объявлению.',

        infoCatalogTitle: 'Каталог объектов',
        infoCatalogText:
          'Пользователь может искать недвижимость по адресу, цене, площади, комнатам и типу сделки.',
        infoModerationTitle: 'Модерация объявлений',
        infoModerationText:
          'Перед публикацией объявление проходит проверку модератором.',
        infoChatTitle: 'Диалоги',
        infoChatText:
          'Покупатель может написать владельцу объявления прямо на платформе.',

        quickStartBadge: 'Быстрый старт',
        quickStartTitle: 'Начните с каталога или создания объявления',
        quickStartText:
          'Платформа подходит и для поиска недвижимости, и для размещения собственных объектов.',
        viewCatalogButton: 'Перейти в каталог',
        addListingButton: 'Добавить объявление',

        forBuyers: 'Для покупателей',
        forBuyersText: 'Поиск, фильтры, карточки объектов и сообщения',
        forOwners: 'Для владельцев',
        forOwnersText: 'Создание объявлений, фото и диалоги',

        catalogImageTitle: 'Поиск недвижимости',
        catalogImageText: 'Удобные фильтры и подробные карточки объектов.',
        createImageTitle: 'Публикация объявлений',
        createImageText: 'Добавьте описание, параметры и фотографии объекта.',
      },

      homePage: {
        badge: 'Платформа недвижимости',
        title: 'Найдите недвижимость для жизни, аренды или инвестиций',
        subtitle:
          'Каталог объявлений с фильтрами, подробными карточками объектов, картой, сообщениями и личным кабинетом пользователя.',
        catalogButton: 'Перейти в каталог',
        createButton: 'Создать объявление',
        statsProperties: 'Объявления',
        statsCities: 'Города',
        statsSupport: 'Поддержка',
        popularTitle: 'Популярные направления',
        featureCatalogTitle: 'Удобный каталог',
        featureCatalogText:
          'Фильтры по цене, типу сделки, площади, комнатам и сортировке.',
        featureChatTitle: 'Сообщения',
        featureChatText:
          'Можно связаться с владельцем объявления прямо на платформе.',
        featureModerationTitle: 'Модерация',
        featureModerationText:
          'Объявления проверяются перед публикацией в каталоге.',
      },

      auth: {
        loginTitle: 'Вход в аккаунт',
        loginSubtitle: 'Введите данные для входа в личный кабинет.',
        registerBadge: 'Регистрация',
        registerTitle: 'Регистрация',
        registerSubtitle: 'Создайте аккаунт, чтобы размещать объявления.',
      
        email: 'Email',
        emailPlaceholder: 'example@mail.com',
        password: 'Пароль',
        passwordPlaceholder: 'Введите пароль',
        passwordMinPlaceholder: 'Минимум 6 символов',
        confirmPassword: 'Подтверждение пароля',
        confirmPasswordPlaceholder: 'Повторите пароль',
        name: 'Имя',
        namePlaceholder: 'Введите имя',
      
        submitLogin: 'Войти',
        submitRegister: 'Зарегистрироваться',
      
        noAccount: 'Ещё нет аккаунта?',
        registerLink: 'Зарегистрироваться',
        alreadyHaveAccount: 'Уже есть аккаунт?',
        loginLink: 'Войти',
      
        agreementText:
          'Я принимаю условия использования и даю согласие на обработку персональных данных.',
      
        loginError: 'Не удалось войти. Проверьте email и пароль.',
        registerError:
          'Не удалось зарегистрироваться. Проверьте данные или попробуйте другой email.',
        registerSuccessText:
          'Аккаунт успешно создан. Теперь можно войти в систему.',
      },

      catalog: {
        badge: 'Каталог',
        title: 'Объявления недвижимости',
        subtitle:
          'Выберите подходящий объект по типу сделки, цене, площади и количеству комнат.',

        objectsFound: 'Объектов найдено',
        searchMode: 'Режим поиска',
        nearbyMode: 'Рядом',
        catalogMode: 'Каталог',

        searchByAddress: 'Поиск по адресу',
        searchPlaceholder: 'Введите город, улицу или район',
        dealType: 'Тип сделки',

        filters: 'Фильтры',
        allTypes: 'Все типы',
        sale: 'Продажа',
        rent: 'Аренда',
        priceFrom: 'Цена от',
        priceTo: 'Цена до',
        areaFrom: 'Площадь от',
        areaTo: 'Площадь до',
        rooms: 'Комнаты',
        allRooms: 'Любое количество',
        studio: 'Студия',
        sort: 'Сортировка',
        sortNewest: 'Сначала новые',
        sortPriceAsc: 'Дешевле',
        sortPriceDesc: 'Дороже',
        applyFilters: 'Показать',
        resetFilters: 'Сбросить',

        found: 'Найдено',
        nearbySearchActive: 'Поиск рядом активен',
        hideMap: 'Скрыть карту',
        mapSearch: 'Поиск на карте',

        nearbyMapTitle: 'Поиск рядом на карте',
        nearbyMapText:
          'Кликните по точке на карте, чтобы найти активные объявления рядом.',
        km: 'км',
        showFullCatalog: 'Показать весь каталог',
        searchRadius: 'Радиус поиска',
        searchingNearby: 'Ищем...',
        findNearby: 'Найти рядом',
        choosePointOnMap: 'Выберите точку на карте',
        selectMapPointAlert: 'Выберите точку на карте.',
        pointSelectedText: 'Точка выбрана. Можно запускать поиск рядом.',
        nearbyResultsStart: 'Показаны объявления в радиусе',
        nearbyResultsMiddle: 'от выбранной точки. Найдено по гео',
        nearbyError:
          'Не удалось выполнить поиск рядом. Проверьте backend и параметры.',
        nearbyLoading: 'Ищем объявления рядом...',

        loading: 'Загружаем объявления...',
        error: 'Не удалось загрузить объявления.',
        loadCatalogErrorTitle: 'Не удалось загрузить каталог',
        loadCatalogErrorText: 'Войдите в аккаунт, чтобы увидеть объявления.',

        emptyTitle: 'Объявлений не найдено',
        emptyText: 'Попробуйте изменить фильтры или сбросить поиск.',
        nearbyNotFoundTitle: 'Рядом ничего не найдено',
        nearbyNotFoundText: 'Попробуйте выбрать другую точку на карте.',

        details: 'Смотреть подробнее',
        noPhoto: 'Фото отсутствует',
        price: 'Цена',
        address: 'Адрес',
        selectObjectPhoto: 'Выбрать фото объекта',
      },

      property: {
        sale: 'Продажа',
        rent: 'Аренда',
        perMonth: 'мес.',
        rooms: 'Комнаты',
        area: 'Площадь',
        description: 'Описание',
        address: 'Адрес',
        contactOwner: 'Связаться с владельцем',
        infrastructure: 'Инфраструктура',
        investment: 'Инвестиции',
        notFound: 'Объявление не найдено',
        notFoundText:
          'Возможно, объявление было удалено или ещё не опубликовано.',
        backToCatalog: 'Вернуться в каталог',
        transport: 'Транспорт',
        metro: 'Метро',
        school: 'Школа',
        kindergarten: 'Детский сад',
        hospital: 'Больница',
        pharmacy: 'Аптека',
        park: 'Парк',
        shops: 'Магазины',
        monthlyRent: 'Арендный доход',
        rentalYield: 'Доходность',
        resaleProfit: 'Потенциал перепродажи',
        selectPhoto: 'Выбрать фото объекта',
        ownListingTitle: 'Это ваше объявление',
        ownListingText: 'Покупатели могут написать вам по этому объявлению. Ответить на сообщения можно здесь или в личном кабинете.',
        openDialogs: 'Открыть диалоги',
        minInvestment: 'Минимальная инвестиция',
        payback: 'Окупаемость',
        years: 'лет',
        profitability: 'Доходность',
        perYear: 'годовых',
        potential: 'Потенциал',
      },

      createPropertyPage: {
        badge: 'Новое объявление',
        title: 'Создайте объявление о недвижимости',
        subtitle:
          'Заполните данные объекта, добавьте фотографии и отправьте объявление на модерацию.',

        statusData: 'Данные объекта',
        statusPhotos: 'Фото',
        statusModeration: 'Модерация',

        afterSendingLabel: 'После отправки',
        afterSendingStatus: 'На модерации',
        afterSendingText:
          'Объявление появится в каталоге после проверки модератором.',
        photoCounterLabel: 'Фото',
        dealTypeShort: 'Тип',

        fillingBadge: 'Заполнение',
        stepBasicTitle: 'Основное',
        stepBasicText: 'Тип сделки и описание',
        stepCharacteristicsTitle: 'Характеристики',
        stepCharacteristicsText: 'Цена, адрес, площадь',
        stepInfrastructureTitle: 'Окружение',
        stepInfrastructureText: 'Инфраструктура рядом',
        stepPhotosTitle: 'Фото',
        stepPhotosText: 'Изображения объекта',

        hintTitle: 'Подсказка',
        hintText:
          'Чем подробнее описание и лучше фото, тем аккуратнее будет выглядеть карточка в каталоге.',

        basicSectionTitle: 'Основная информация',
        basicSectionText:
          'Выберите тип сделки и напишите понятное описание объекта.',
        characteristicsSectionTitle: 'Характеристики объекта',
        characteristicsSectionText:
          'Эти данные попадут в карточку объявления и фильтры каталога.',

        dealType: 'Тип сделки',
        saleDescription: 'Продажа квартиры, дома или коммерческого объекта.',
        rentDescription: 'Аренда объекта с оплатой за месяц.',

        titleLabel: 'Заголовок объявления',
        titlePlaceholder: 'Например: уютная квартира в центре',
        description: 'Описание',
        descriptionPlaceholder:
          'Опишите объект, ремонт, район, преимущества и условия сделки.',
        price: 'Цена',
        pricePlaceholder: 'Например: 12000000',
        address: 'Адрес',
        addressPlaceholder: 'Например: Złota 44, Warszawa, Poland',
        area: 'Площадь',
        areaPlaceholder: 'Например: 65',
        rooms: 'Количество комнат',
        studio: 'Студия',

        infrastructureTitle: 'Инфраструктура рядом',
        infrastructureSubtitle:
          'Отметьте, что находится рядом с объектом.',
        hasMetro: 'Метро',
        hasSchool: 'Школа',
        hasKindergarten: 'Детский сад',
        hasPark: 'Парк',
        hasShops: 'Магазины',
        hasHospital: 'Больница',

        investmentTitle: 'Инвестиционный блок',
        investmentSubtitle:
          'Укажите показатели, если объект подходит для инвестиций.',
        monthlyRent: 'Ожидаемая месячная аренда',
        monthlyRentPlaceholder: 'Например: 60000',
        rentalYield: 'Годовая доходность, %',
        rentalYieldPlaceholder: 'Например: 7.5',
        resaleProfit: 'Потенциал перепродажи',
        resaleProfitPlaceholder: 'Например: 500000',
        investmentComment: 'Комментарий по инвестициям',
        investmentCommentPlaceholder:
          'Например: район активно развивается',

        photos: 'Фотографии',
        photosSectionText:
          'Добавьте фотографии объекта. Они сделают карточку объявления заметнее.',
        dragPhotos: 'Перетащите фотографии сюда',
        choosePhotosText: 'Можно загрузить до {{count}} фотографий.',
        choosePhotosButton: 'Выбрать фотографии',
        deletePhoto: 'Удалить',
        onlyImagesError: 'Можно загрузить только изображения.',
        someFilesError: 'Некоторые файлы не являются изображениями.',
        maxPhotosError: 'Можно загрузить максимум {{count}} фотографий.',

        submit: 'Создать объявление',
        submitting: 'Создаём объявление...',
        successTitle: 'Объявление успешно создано',
        successText:
          'Если вы добавили фотографии, они загружены. Объявление отправлено на модерацию и появится в каталоге после одобрения.',
        errorText:
          'Не удалось создать объявление. Проверьте данные и попробуйте ещё раз.',
      },

      profile: {
        profileBadge: 'Личный кабинет',
        title: 'Профиль',
        loggedInAs: 'Вы вошли как',
        notAuthenticatedTitle: 'Войдите в аккаунт',
        notAuthenticatedText:
          'Для просмотра личного кабинета необходимо войти или зарегистрироваться.',

        createProperty: 'Создать объявление',
        goToCatalog: 'Открыть каталог',
        myListingsStat: 'Мои объявления',
        profileSections: 'Разделы профиля',
        profileSectionsText: 'диалоги, объявления, аккаунт',

        editBadge: 'Редактирование',
        editTitle: 'Редактировать объявление',
        editSubtitle:
          'После сохранения объявление снова отправится на модерацию.',
        updateError: 'Не удалось обновить объявление.',
        updateAlertError:
          'Не удалось обновить объявление. Попробуйте ещё раз.',
        deleteAlertError:
          'Не удалось удалить объявление. Попробуйте ещё раз.',
        deleteConfirm: 'Удалить объявление?',

        dealType: 'Тип сделки',
        roomsLabel: 'Комнаты',
        titleLabel: 'Заголовок',
        descriptionLabel: 'Описание',
        priceLabel: 'Цена',
        addressLabel: 'Адрес',
        areaLabel: 'Площадь',

        infrastructureTitle: 'Инфраструктура рядом',
        metroNearby: 'Метро / остановка рядом',
        hospitalNearby: 'Больница / поликлиника',

        investmentTitle: 'Инвестиционная информация',
        minInvestmentLabel: 'Минимальная инвестиция, ₽',
        rentalYieldLabel: 'Доходность, % годовых',
        paybackYearsLabel: 'Окупаемость, лет',

        saving: 'Сохраняем...',
        saveChanges: 'Сохранить изменения',

        propertiesBadge: 'Объявления',
        myProperties: 'Мои объявления',
        managePropertiesText:
          'Здесь отображаются объявления, которые вы создали на платформе.',
        total: 'Всего',
        loadingProperties: 'Загружаем объявления...',
        loadError: 'Не удалось загрузить объявления.',
        emptyTitle: 'Объявлений пока нет',
        emptyText:
          'Создайте первое объявление, чтобы оно появилось в личном кабинете.',

        draft: 'Черновик',
        moderation: 'На модерации',
        active: 'Опубликовано',
        rejected: 'Отклонено',

        selectPhoto: 'Выбрать фото',
        showFull: 'Показать полностью',
        hideFull: 'Свернуть',
        deleting: 'Удаляем...',
      },

      profilePage: {
        badge: 'Личный кабинет',
        title: 'Профиль пользователя',
        subtitle:
          'Здесь можно посмотреть данные аккаунта, свои объявления и сообщения.',
        accountTitle: 'Данные аккаунта',
        email: 'Email',
        role: 'Роль',
        userRole: 'Пользователь',
        moderatorRole: 'Модератор',
        myPropertiesTitle: 'Мои объявления',
        myPropertiesSubtitle:
          'Объявления, которые вы создали на платформе.',
        noPropertiesTitle: 'Объявлений пока нет',
        noPropertiesText:
          'Создайте первое объявление, чтобы оно появилось в личном кабинете.',
        createProperty: 'Создать объявление',
        loadingProperties: 'Загружаем объявления...',
        propertiesError: 'Не удалось загрузить ваши объявления.',
        status: 'Статус',
        edit: 'Редактировать',
        remove: 'Удалить',
      },

      inboxMessages: {
        badge: 'Сообщения',
        title: 'Диалоги',
        dialogLabel: 'Диалог',
        listingLabel: 'Объявление',
        subtitle:
          'Переписки по объявлениям открываются в отдельном окне, чтобы личный кабинет не был перегружен.',
        total: 'Всего',
        new: 'Новых',
        openDialogs: 'Открыть диалоги',
        refresh: 'Обновить',
        refreshing: 'Обновляем...',
        chats: 'Чаты',
        loadingDialogs: 'Загружаем диалоги...',
        dialogsError: 'Не удалось загрузить диалоги.',
        emptyDialogs: 'Диалогов пока нет.',
        noMessages: 'Сообщений пока нет',
        selectDialog: 'Выберите диалог',
        selectDialogText: 'После выбора диалога здесь появится переписка.',
        loadingMessages: 'Загружаем сообщения...',
        messagesError: 'Не удалось загрузить сообщения.',
        emptyMessages: 'В этом диалоге пока нет сообщений.',
        me: 'Вы',
        interlocutor: 'Собеседник',
        placeholder: 'Напишите сообщение...',
        send: 'Отправить',
        sending: 'Отправляем...',
        sendError: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        enterHint: 'Enter — отправить, Shift + Enter — новая строка',
      },

      contactOwnerModal: {
        buyerLabel: 'Покупатель',
        ownerLabel: 'Владелец',
        selectBuyer: 'Выберите покупателя.',
        loadingDialogs: 'Загрузка диалогов...',
        sending: 'Отправляем...',
        title: 'Связаться с владельцем',
        ownerTitle: 'Диалоги по объявлению',
        dialogsList: 'Диалоги',
        noOwnerDialogs: 'По этому объявлению пока нет диалогов.',
        noMessages: 'Сообщений пока нет',
        loadingChat: 'Загрузка чата...',
        loadChatError: 'Не удалось загрузить чат.',
        emptyChat: 'Сообщений пока нет. Напишите первое сообщение.',
        me: 'Вы',
        replyPlaceholder: 'Напишите сообщение...',
        send: 'Отправить',
        sendError: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        enterHint: 'Enter — отправить, Shift + Enter — новая строка.',
      },

      deleteAccount: {
        badge: 'Удаление аккаунта',
        title: 'Удалить аккаунт',
        description:
          'Вы можете удалить аккаунт. Вместе с аккаунтом будут удалены связанные объявления и сообщения.',
        warning:
          'Это действие необратимо. После удаления восстановить аккаунт и данные будет невозможно.',
        deleteButton: 'Удалить аккаунт',
        deletingButton: 'Удаляем...',
        deleted: 'Аккаунт удалён. Сейчас вы будете перенаправлены.',
        error: 'Не удалось удалить аккаунт. Попробуйте ещё раз.',
        confirmTitle: 'Подтвердите удаление',
        confirmTextStart: 'Вы действительно хотите удалить аккаунт',
        confirmTextEnd: 'Это действие нельзя отменить.',
        confirmButton: 'Да, удалить',
        confirmingButton: 'Удаляем...',
        cancelButton: 'Отмена',
      },

      moderationPage: {
        accessLimited: 'Доступ ограничен',
        noAccessTitle: 'Панель модератора недоступна',
        noAccessText:
          'Эта страница доступна только пользователям с ролью модератора.',
        backToProfile: 'Вернуться в профиль',

        badge: 'Панель модератора',
        title: 'Объявления на проверке',
        subtitle:
          'Здесь модератор может проверить объявление, одобрить его или отклонить с причиной.',

        reviewPill: 'Проверка объявлений',
        onReview: 'На проверке',
        approval: 'Одобрение',
        approvalText: 'Объявление появится в каталоге',
        rejection: 'Отклонение',
        rejectionWithReason: 'Отклонение с причиной',
        rejectionText: 'Пользователь увидит причину отказа',
        actionsHistory: 'История действий',

        onReviewText: 'Объявления, которые ожидают решения модератора.',

        queueBadge: 'Очередь',
        queueTitle: 'Очередь модерации',
        queueSubtitle:
          'Проверьте описание, фотографии, цену и адрес перед публикацией.',
        total: 'Всего',
        loading: 'Загружаем объявления...',
        loadError: 'Не удалось загрузить объявления на модерации.',
        emptyTitle: 'Очередь пуста',
        emptyText: 'Сейчас нет объявлений, ожидающих проверки.',

        selectPhoto: 'Выбрать фото',
        statusModeration: 'На модерации',
        showFull: 'Показать полностью',
        hideFull: 'Свернуть',
        approve: 'Одобрить',
        approving: 'Одобряем...',
        approveError: 'Не удалось одобрить объявление. Попробуйте ещё раз.',
        reject: 'Отклонить',
        rejectReasonLabel: 'Причина отклонения',
        rejectReasonPlaceholder:
          'Например: недостаточно информации, некорректные фотографии или неверный адрес.',
        rejectError: 'Не удалось отклонить объявление.',
        rejectAlertError: 'Не удалось отклонить объявление. Попробуйте ещё раз.',
        rejecting: 'Отклоняем...',
        confirmReject: 'Подтвердить отклонение',

        logsBadge: 'История',
        logsTitle: 'История модерации',
        logsSubtitle:
          'Здесь отображаются действия модератора по объявлениям.',
        logsLoading: 'Загружаем историю...',
        logsError: 'Не удалось загрузить историю модерации.',
        logsEmptyTitle: 'История пока пуста',
        logsEmptyText:
          'После одобрения или отклонения объявлений здесь появятся записи.',
        logListingId: 'ID объявления',
        logAction: 'Действие',
        logReason: 'Причина',
      },

      cookieConsent: {
        title: 'Мы используем cookie',
        text: 'Cookie помогают сохранять настройки, улучшать работу сайта и учитывать согласие пользователя.',
        decline: 'Отклонить',
        accept: 'Принять',
      },

      validation: {
        emailRequired: 'Введите email',
        emailInvalid: 'Введите корректный email',
        passwordRequired: 'Введите пароль',
        passwordMin: 'Пароль должен содержать минимум 6 символов',
        nameRequired: 'Введите имя',
        nameMin: 'Имя должно содержать минимум 2 символа',
        nameMax: 'Имя слишком длинное',
        confirmPasswordRequired: 'Повторите пароль',
        agreementRequired: 'Нужно принять условия и согласие на обработку данных',
        passwordsDoNotMatch: 'Пароли не совпадают',
      
        dealTypeRequired: 'Выберите тип сделки',
        titleMin: 'Заголовок должен содержать минимум 5 символов',
        titleMax: 'Заголовок слишком длинный',
        descriptionMin: 'Описание должно содержать минимум 10 символов',
        descriptionMax: 'Описание слишком длинное',
        priceRequired: 'Введите цену',
        pricePositive: 'Цена должна быть больше 0',
        priceMax: 'Цена слишком большая',
        addressMin: 'Адрес должен содержать минимум 5 символов',
        addressMax: 'Адрес слишком длинный',
        areaRequired: 'Введите площадь',
        areaPositive: 'Площадь должна быть больше 0',
        areaMax: 'Площадь слишком большая',
        roomsRequired: 'Введите количество комнат',
        roomsInteger: 'Количество комнат должно быть целым числом',
        roomsMin: 'Количество комнат не может быть отрицательным',
        roomsMax: 'Слишком большое количество комнат',
        positiveValue: 'Значение должно быть больше 0',
        commentMax: 'Комментарий слишком длинный',
      },

      loginPreview: {
        badge: 'Вход в систему',
        profileBadge: 'Личный кабинет',
        title: 'Вернитесь к объявлениям, сообщениям и личному кабинету',
        subtitle:
          'После входа можно управлять своими объектами, отвечать на сообщения и быстро переходить к нужным разделам платформы.',
        objectsLabel: 'Объекты',
        chatLabel: 'Чат',
        accountLabel: 'Аккаунт',
        catalog: 'Каталог',
        dialogs: 'Диалоги',
        profile: 'Профиль',
        cardTitle: 'Личный кабинет',
        cardSubtitle: 'доступен после входа',
        cardStatus: 'online',
        bottomBadge: 'Realtor Platform',
        bottomText: 'Объявления, профиль и сообщения в одном месте',
        mobileText:
          'Войдите, чтобы управлять объявлениями, профилем и сообщениями.',
      },

      registerPreview: {
        badge: 'Новый аккаунт',
        title: 'Создайте профиль для работы с недвижимостью',
        subtitle:
          'После регистрации вы сможете размещать объявления, отправлять их на модерацию и общаться с владельцами объектов.',
        searchLabel: 'Поиск',
        publishLabel: 'Размещение',
        connectionLabel: 'Связь',
        catalog: 'Каталог',
        listings: 'Объявления',
        messages: 'Сообщения',
        cardTitle: 'Новый объект',
        cardSubtitle: 'можно добавить после регистрации',
        cardStatus: 'готово',
        bottomBadge: 'Участок в каталоге',
        bottomText: 'Добавляйте объекты, фото, описание и характеристики',
        mobileText:
          'Создайте профиль, чтобы размещать объявления и пользоваться платформой.',
      },
    },
  },

  en: {
    translation: {
      common: {
        appName: 'Realtor Platform',
        home: 'Home',
        catalog: 'Catalog',
        createProperty: 'Create listing',
        profile: 'Profile',
        moderation: 'Moderation',
        login: 'Log in',
        logout: 'Log out',
        register: 'Register',
        details: 'Details',
        backToCatalog: 'Back to catalog',
        cancel: 'Cancel',
        loading: 'Loading...',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        refresh: 'Refresh',
      },

      home: {
        badge: 'Real estate platform',
        title: 'Find a property for living, renting, or investing',
        subtitle:
          'A listings catalog with filters, detailed property pages, map search, messages, and a user profile.',

        catalogTag: 'Catalog',
        listingTag: 'Listing',
        findObject: 'Find a property',
        publishObject: 'Publish a property',

        openCatalogTitle: 'Open catalog',
        openCatalogText:
          'Browse active listings and filter them by price, area, rooms, and deal type.',
        createListingTitle: 'Create listing',
        createListingText:
          'Add a property, upload photos, specify infrastructure, and send the listing for moderation.',

        viewListingsButton: 'View listings',
        publishListingButton: 'Publish listing',

        heroCardTitle: 'Convenient property workflow',
        heroCardText:
          'Buyers see detailed property cards, while owners can receive messages about their listings.',

        infoCatalogTitle: 'Property catalog',
        infoCatalogText:
          'Users can search real estate by address, price, area, rooms, and deal type.',
        infoModerationTitle: 'Listing moderation',
        infoModerationText:
          'Before publication, every listing is reviewed by a moderator.',
        infoChatTitle: 'Dialogs',
        infoChatText:
          'A buyer can contact the listing owner directly on the platform.',

        quickStartBadge: 'Quick start',
        quickStartTitle: 'Start with the catalog or create a listing',
        quickStartText:
          'The platform works both for property search and for publishing your own listings.',
        viewCatalogButton: 'Open catalog',
        addListingButton: 'Add listing',

        forBuyers: 'For buyers',
        forBuyersText: 'Search, filters, property cards, and messages',
        forOwners: 'For owners',
        forOwnersText: 'Listing creation, photos, and dialogs',

        catalogImageTitle: 'Property search',
        catalogImageText: 'Convenient filters and detailed property cards.',
        createImageTitle: 'Listing publication',
        createImageText: 'Add description, parameters, and property photos.',
      },

      homePage: {
        badge: 'Real estate platform',
        title: 'Find a property for living, renting, or investing',
        subtitle:
          'A listings catalog with filters, property details, map, messages, and user profile.',
        catalogButton: 'Open catalog',
        createButton: 'Create listing',
        statsProperties: 'Listings',
        statsCities: 'Cities',
        statsSupport: 'Support',
        popularTitle: 'Popular directions',
        featureCatalogTitle: 'Convenient catalog',
        featureCatalogText:
          'Filters by price, deal type, area, rooms, and sorting.',
        featureChatTitle: 'Messages',
        featureChatText:
          'Contact the listing owner directly on the platform.',
        featureModerationTitle: 'Moderation',
        featureModerationText:
          'Listings are checked before they appear in the catalog.',
      },

      auth: {
        loginTitle: 'Log in to your account',
        loginSubtitle: 'Enter your credentials to access your profile.',
        registerBadge: 'Registration',
        registerTitle: 'Registration',
        registerSubtitle: 'Create an account to publish listings.',
      
        email: 'Email',
        emailPlaceholder: 'example@mail.com',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        passwordMinPlaceholder: 'At least 6 characters',
        confirmPassword: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat password',
        name: 'Name',
        namePlaceholder: 'Enter your name',
      
        submitLogin: 'Log in',
        submitRegister: 'Register',
      
        noAccount: "Don't have an account yet?",
        registerLink: 'Register',
        alreadyHaveAccount: 'Already have an account?',
        loginLink: 'Log in',
      
        agreementText:
          'I accept the terms of use and consent to the processing of personal data.',
      
        loginError: 'Could not log in. Check your email and password.',
        registerError:
          'Could not register. Check the data or try another email.',
        registerSuccessText:
          'Account created successfully. You can now log in.',
      },

      catalog: {
        badge: 'Catalog',
        title: 'Real estate listings',
        subtitle:
          'Choose a suitable property by deal type, price, area, and number of rooms.',

        objectsFound: 'Properties found',
        searchMode: 'Search mode',
        nearbyMode: 'Nearby',
        catalogMode: 'Catalog',

        searchByAddress: 'Search by address',
        searchPlaceholder: 'Enter a city, street, or district',
        dealType: 'Deal type',

        filters: 'Filters',
        allTypes: 'All types',
        sale: 'Sale',
        rent: 'Rent',
        priceFrom: 'Price from',
        priceTo: 'Price to',
        areaFrom: 'Area from',
        areaTo: 'Area to',
        rooms: 'Rooms',
        allRooms: 'Any rooms',
        studio: 'Studio',
        sort: 'Sort',
        sortNewest: 'Newest first',
        sortPriceAsc: 'Cheaper',
        sortPriceDesc: 'More expensive',
        applyFilters: 'Show',
        resetFilters: 'Reset',

        found: 'Found',
        nearbySearchActive: 'Nearby search is active',
        hideMap: 'Hide map',
        mapSearch: 'Map search',

        nearbyMapTitle: 'Nearby search on map',
        nearbyMapText:
          'Click a point on the map to find active listings nearby.',
        km: 'km',
        showFullCatalog: 'Show full catalog',
        searchRadius: 'Search radius',
        searchingNearby: 'Searching...',
        findNearby: 'Find nearby',
        choosePointOnMap: 'Choose a point on the map',
        selectMapPointAlert: 'Choose a point on the map.',
        pointSelectedText: 'Point selected. You can start nearby search.',
        nearbyResultsStart: 'Showing listings within',
        nearbyResultsMiddle: 'from the selected point. Found by geo',
        nearbyError:
          'Could not perform nearby search. Check the backend and parameters.',
        nearbyLoading: 'Searching for nearby listings...',

        loading: 'Loading listings...',
        error: 'Could not load listings.',
        loadCatalogErrorTitle: 'Could not load catalog',
        loadCatalogErrorText: 'Log in to see listings.',

        emptyTitle: 'No listings found',
        emptyText: 'Try changing filters or resetting the search.',
        nearbyNotFoundTitle: 'Nothing found nearby',
        nearbyNotFoundText: 'Try selecting another point on the map.',

        details: 'View details',
        noPhoto: 'No photo',
        price: 'Price',
        address: 'Address',
        selectObjectPhoto: 'Select property photo',
      },

      property: {
        sale: 'Sale',
        rent: 'Rent',
        perMonth: 'month',
        rooms: 'Rooms',
        area: 'Area',
        description: 'Description',
        address: 'Address',
        contactOwner: 'Contact owner',
        infrastructure: 'Infrastructure',
        investment: 'Investment',
        notFound: 'Listing not found',
        notFoundText:
          'The listing may have been deleted or not published yet.',
        backToCatalog: 'Back to catalog',
        transport: 'Transport',
        metro: 'Metro',
        school: 'School',
        kindergarten: 'Kindergarten',
        hospital: 'Hospital',
        pharmacy: 'Pharmacy',
        park: 'Park',
        shops: 'Shops',
        monthlyRent: 'Rental income',
        rentalYield: 'Yield',
        resaleProfit: 'Resale potential',
        selectPhoto: 'Select property photo',
        ownListingTitle: 'This is your listing',
        ownListingText:
        'Buyers can message you about this listing. You can reply here or in your profile.',
        openDialogs: 'Open dialogs',
        minInvestment: 'Minimum investment',
        payback: 'Payback period',
        years: 'years',
        profitability: 'Profitability',
        perYear: 'per year',
        potential: 'Potential',
      },

      createPropertyPage: {
        badge: 'New listing',
        title: 'Create a real estate listing',
        subtitle:
          'Fill in the property details, add photos, and send the listing for moderation.',

        statusData: 'Property data',
        statusPhotos: 'Photos',
        statusModeration: 'Moderation',

        afterSendingLabel: 'After sending',
        afterSendingStatus: 'On moderation',
        afterSendingText:
          'The listing will appear in the catalog after moderator review.',
        photoCounterLabel: 'Photos',
        dealTypeShort: 'Type',

        fillingBadge: 'Filling',
        stepBasicTitle: 'Basic',
        stepBasicText: 'Deal type and description',
        stepCharacteristicsTitle: 'Characteristics',
        stepCharacteristicsText: 'Price, address, area',
        stepInfrastructureTitle: 'Surroundings',
        stepInfrastructureText: 'Nearby infrastructure',
        stepPhotosTitle: 'Photos',
        stepPhotosText: 'Property images',

        hintTitle: 'Hint',
        hintText:
          'The more detailed the description and the better the photos, the better the listing card will look in the catalog.',

        basicSectionTitle: 'Basic information',
        basicSectionText:
          'Select the deal type and write a clear property description.',
        characteristicsSectionTitle: 'Property characteristics',
        characteristicsSectionText:
          'This data will be shown in the listing card and catalog filters.',

        dealType: 'Deal type',
        saleDescription: 'Sale of an apartment, house, or commercial property.',
        rentDescription: 'Property rental with monthly payment.',

        titleLabel: 'Listing title',
        titlePlaceholder: 'Example: cozy apartment in the center',
        description: 'Description',
        descriptionPlaceholder:
          'Describe the property, renovation, district, advantages, and deal terms.',
        price: 'Price',
        pricePlaceholder: 'Example: 12000000',
        address: 'Address',
        addressPlaceholder: 'Example: Złota 44, Warszawa, Poland',
        area: 'Area',
        areaPlaceholder: 'Example: 65',
        rooms: 'Number of rooms',
        studio: 'Studio',

        infrastructureTitle: 'Nearby infrastructure',
        infrastructureSubtitle: 'Select what is located near the property.',
        hasMetro: 'Metro',
        hasSchool: 'School',
        hasKindergarten: 'Kindergarten',
        hasPark: 'Park',
        hasShops: 'Shops',
        hasHospital: 'Hospital',

        investmentTitle: 'Investment block',
        investmentSubtitle:
          'Enter indicators if the property is suitable for investment.',
        monthlyRent: 'Expected monthly rent',
        monthlyRentPlaceholder: 'Example: 60000',
        rentalYield: 'Annual yield, %',
        rentalYieldPlaceholder: 'Example: 7.5',
        resaleProfit: 'Resale potential',
        resaleProfitPlaceholder: 'Example: 500000',
        investmentComment: 'Investment comment',
        investmentCommentPlaceholder:
          'Example: the district is actively developing',

        photos: 'Photos',
        photosSectionText:
          'Add property photos. They will make the listing card more noticeable.',
        dragPhotos: 'Drag photos here',
        choosePhotosText: 'You can upload up to {{count}} photos.',
        choosePhotosButton: 'Choose photos',
        deletePhoto: 'Delete',
        onlyImagesError: 'Only images can be uploaded.',
        someFilesError: 'Some files are not images.',
        maxPhotosError: 'You can upload a maximum of {{count}} photos.',

        submit: 'Create listing',
        submitting: 'Creating listing...',
        successTitle: 'Listing created successfully',
        successText:
          'If you added photos, they were uploaded. The listing has been sent for moderation and will appear in the catalog after approval.',
        errorText:
          'Could not create the listing. Check the data and try again.',
      },

      profile: {
        profileBadge: 'Profile',
        title: 'Profile',
        loggedInAs: 'You are logged in as',
        notAuthenticatedTitle: 'Log in to your account',
        notAuthenticatedText:
          'To view your profile, you need to log in or register.',

        createProperty: 'Create listing',
        goToCatalog: 'Open catalog',
        myListingsStat: 'My listings',
        profileSections: 'Profile sections',
        profileSectionsText: 'dialogs, listings, account',

        editBadge: 'Editing',
        editTitle: 'Edit listing',
        editSubtitle:
          'After saving, the listing will be sent for moderation again.',
        updateError: 'Could not update the listing.',
        updateAlertError: 'Could not update the listing. Try again.',
        deleteAlertError: 'Could not delete the listing. Try again.',
        deleteConfirm: 'Delete listing?',

        dealType: 'Deal type',
        roomsLabel: 'Rooms',
        titleLabel: 'Title',
        descriptionLabel: 'Description',
        priceLabel: 'Price',
        addressLabel: 'Address',
        areaLabel: 'Area',

        infrastructureTitle: 'Nearby infrastructure',
        metroNearby: 'Metro / transport stop nearby',
        hospitalNearby: 'Hospital / clinic',

        investmentTitle: 'Investment information',
        minInvestmentLabel: 'Minimum investment, ₽',
        rentalYieldLabel: 'Yield, % per year',
        paybackYearsLabel: 'Payback period, years',

        saving: 'Saving...',
        saveChanges: 'Save changes',

        propertiesBadge: 'Listings',
        myProperties: 'My listings',
        managePropertiesText:
          'Here you can see the listings you created on the platform.',
        total: 'Total',
        loadingProperties: 'Loading listings...',
        loadError: 'Could not load listings.',
        emptyTitle: 'No listings yet',
        emptyText: 'Create your first listing to see it in your profile.',

        draft: 'Draft',
        moderation: 'On moderation',
        active: 'Published',
        rejected: 'Rejected',

        selectPhoto: 'Select photo',
        showFull: 'Show full',
        hideFull: 'Collapse',
        deleting: 'Deleting...',
      },

      profilePage: {
        badge: 'Profile',
        title: 'User profile',
        subtitle:
          'Here you can view account data, your listings, and messages.',
        accountTitle: 'Account data',
        email: 'Email',
        role: 'Role',
        userRole: 'User',
        moderatorRole: 'Moderator',
        myPropertiesTitle: 'My listings',
        myPropertiesSubtitle: 'Listings you created on the platform.',
        noPropertiesTitle: 'No listings yet',
        noPropertiesText:
          'Create your first listing to see it in your profile.',
        createProperty: 'Create listing',
        loadingProperties: 'Loading listings...',
        propertiesError: 'Could not load your listings.',
        status: 'Status',
        edit: 'Edit',
        remove: 'Delete',
      },

      inboxMessages: {
        badge: 'Messages',
        title: 'Dialogs',
        dialogLabel: 'Dialog',
        listingLabel: 'Listing',
        subtitle:
          'Listing conversations open in a separate window to keep the profile page clean.',
        total: 'Total',
        new: 'New',
        openDialogs: 'Open dialogs',
        refresh: 'Refresh',
        refreshing: 'Refreshing...',
        chats: 'Chats',
        loadingDialogs: 'Loading dialogs...',
        dialogsError: 'Could not load dialogs.',
        emptyDialogs: 'No dialogs yet.',
        noMessages: 'No messages yet',
        selectDialog: 'Select a dialog',
        selectDialogText: 'After selecting a dialog, messages will appear here.',
        loadingMessages: 'Loading messages...',
        messagesError: 'Could not load messages.',
        emptyMessages: 'There are no messages in this dialog yet.',
        me: 'You',
        interlocutor: 'Interlocutor',
        placeholder: 'Write a message...',
        send: 'Send',
        sending: 'Sending...',
        sendError: 'Could not send the message. Try again.',
        enterHint: 'Enter — send, Shift + Enter — new line',
      },

      contactOwnerModal: {
        buyerLabel: 'Buyer',
        ownerLabel: 'Owner',
        selectBuyer: 'Select a buyer.',
        loadingDialogs: 'Loading dialogs...',
        sending: 'Sending...',
        title: 'Contact owner',
        ownerTitle: 'Listing dialogs',
        dialogsList: 'Dialogs',
        noOwnerDialogs: 'There are no dialogs for this listing yet.',
        noMessages: 'No messages yet',
        loadingChat: 'Loading chat...',
        loadChatError: 'Could not load chat.',
        emptyChat: 'No messages yet. Write the first message.',
        me: 'You',
        replyPlaceholder: 'Write a message...',
        send: 'Send',
        sendError: 'Could not send the message. Try again.',
        enterHint: 'Enter — send, Shift + Enter — new line.',
      },

      deleteAccount: {
        badge: 'Account deletion',
        title: 'Delete account',
        description:
          'You can delete your account. Related listings and messages will also be deleted.',
        warning:
          'This action is irreversible. After deletion, the account and data cannot be restored.',
        deleteButton: 'Delete account',
        deletingButton: 'Deleting...',
        deleted: 'Account deleted. You will be redirected shortly.',
        error: 'Could not delete the account. Try again.',
        confirmTitle: 'Confirm deletion',
        confirmTextStart: 'Do you really want to delete the account',
        confirmTextEnd: 'This action cannot be undone.',
        confirmButton: 'Yes, delete',
        confirmingButton: 'Deleting...',
        cancelButton: 'Cancel',
      },

      moderationPage: {
        accessLimited: 'Access restricted',
        noAccessTitle: 'Moderator panel is unavailable',
        noAccessText:
          'This page is available only to users with the moderator role.',
        backToProfile: 'Back to profile',

        badge: 'Moderator panel',
        title: 'Listings for review',
        subtitle:
          'Here the moderator can review a listing, approve it, or reject it with a reason.',

        reviewPill: 'Listing review',
        onReview: 'On review',
        approval: 'Approval',
        approvalText: 'The listing will appear in the catalog',
        rejection: 'Rejection',
        rejectionWithReason: 'Rejection with reason',
        rejectionText: 'The user will see the rejection reason',
        actionsHistory: 'Action history',

        onReviewText: 'Listings waiting for moderator decision.',

        queueBadge: 'Queue',
        queueTitle: 'Moderation queue',
        queueSubtitle:
          'Check the description, photos, price, and address before publishing.',
        total: 'Total',
        loading: 'Loading listings...',
        loadError: 'Could not load listings for moderation.',
        emptyTitle: 'Queue is empty',
        emptyText: 'There are no listings waiting for review right now.',

        selectPhoto: 'Select photo',
        statusModeration: 'On moderation',
        showFull: 'Show full',
        hideFull: 'Collapse',
        approve: 'Approve',
        approving: 'Approving...',
        approveError: 'Could not approve the listing. Try again.',
        reject: 'Reject',
        rejectReasonLabel: 'Rejection reason',
        rejectReasonPlaceholder:
          'Example: not enough information, incorrect photos, or invalid address.',
        rejectError: 'Could not reject the listing.',
        rejectAlertError: 'Could not reject the listing. Try again.',
        rejecting: 'Rejecting...',
        confirmReject: 'Confirm rejection',

        logsBadge: 'History',
        logsTitle: 'Moderation history',
        logsSubtitle:
          'Moderator actions for listings are displayed here.',
        logsLoading: 'Loading history...',
        logsError: 'Could not load moderation history.',
        logsEmptyTitle: 'History is empty',
        logsEmptyText:
          'After approving or rejecting listings, records will appear here.',
        logListingId: 'Listing ID',
        logAction: 'Action',
        logReason: 'Reason',
      },

      cookieConsent: {
        title: 'We use cookies',
        text: 'Cookies help save settings, improve the website, and remember user consent.',
        decline: 'Decline',
        accept: 'Accept',
      },

      validation: {
        emailRequired: 'Enter email',
        emailInvalid: 'Enter a valid email',
        passwordRequired: 'Enter password',
        passwordMin: 'Password must contain at least 6 characters',
        nameRequired: 'Enter name',
        nameMin: 'Name must contain at least 2 characters',
        nameMax: 'Name is too long',
        confirmPasswordRequired: 'Repeat password',
        agreementRequired:
          'You need to accept the terms and consent to data processing',
        passwordsDoNotMatch: 'Passwords do not match',
      
        dealTypeRequired: 'Select deal type',
        titleMin: 'Title must contain at least 5 characters',
        titleMax: 'Title is too long',
        descriptionMin: 'Description must contain at least 10 characters',
        descriptionMax: 'Description is too long',
        priceRequired: 'Enter price',
        pricePositive: 'Price must be greater than 0',
        priceMax: 'Price is too high',
        addressMin: 'Address must contain at least 5 characters',
        addressMax: 'Address is too long',
        areaRequired: 'Enter area',
        areaPositive: 'Area must be greater than 0',
        areaMax: 'Area is too large',
        roomsRequired: 'Enter number of rooms',
        roomsInteger: 'Number of rooms must be an integer',
        roomsMin: 'Number of rooms cannot be negative',
        roomsMax: 'Too many rooms',
        positiveValue: 'Value must be greater than 0',
        commentMax: 'Comment is too long',
      },

      loginPreview: {
        badge: 'System login',
        profileBadge: 'Personal account',
        title: 'Return to listings, messages, and your profile',
        subtitle:
          'After logging in, you can manage your properties, reply to messages, and quickly access the platform sections.',
        objectsLabel: 'Properties',
        chatLabel: 'Chat',
        accountLabel: 'Account',
        catalog: 'Catalog',
        dialogs: 'Dialogs',
        profile: 'Profile',
        cardTitle: 'Personal account',
        cardSubtitle: 'available after login',
        cardStatus: 'online',
        bottomBadge: 'Realtor Platform',
        bottomText: 'Listings, profile, and messages in one place',
        mobileText:
          'Log in to manage listings, profile, and messages.',
      },

      registerPreview: {
        badge: 'New account',
        title: 'Create a profile to work with real estate',
        subtitle:
          'After registration, you will be able to publish listings, send them for moderation, and communicate with property owners.',
        searchLabel: 'Search',
        publishLabel: 'Publishing',
        connectionLabel: 'Contact',
        catalog: 'Catalog',
        listings: 'Listings',
        messages: 'Messages',
        cardTitle: 'New property',
        cardSubtitle: 'can be added after registration',
        cardStatus: 'ready',
        bottomBadge: 'Property in catalog',
        bottomText: 'Add properties, photos, descriptions, and characteristics',
        mobileText:
          'Create a profile to publish listings and use the platform.',
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('i18nextLng') || 'ru',
  fallbackLng: 'ru',
  supportedLngs: ['ru', 'en'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n