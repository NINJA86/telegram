let socket = null;
let namespaceSocket = null;
let currentRoomId = null;
let userInfo = null;

export const setCurrentUser = (userData) => {
  userInfo = userData;
  console.log(userInfo.id);
};

export const showNamespaces = (namespaces, socket) => {
  const chatCategories = document.querySelector('.sidebar__categories-list');
  chatCategories.innerHTML = '';
  getNamespaceChats(namespaces[0].href); //* rendering the first rooms of namespace
  namespaces.forEach((namespace, index) => {
    chatCategories.insertAdjacentHTML(
      'beforeend',
      `
              <li data-title="${
                namespace.title
              }" class="sidebar__categories-item ${
                index === 0 && 'sidebar__categories-item--active'
              }" data-category-name="all">
                <span class="sidebar__categories-text">${namespace.title}</span>
                <!-- <span class="sidebar__categories-counter sidebar__counter">3</span> -->
            </li>
          `,
    );
  });
};

export const showActiveNamespace = (namespaces) => {
  let sidebarCategoriesItem = document.querySelectorAll(
    '.sidebar__categories-item',
  );
  sidebarCategoriesItem.forEach((item) => {
    item.addEventListener('click', function (e) {
      const namespaceTitle = item.dataset.title;
      const mainNamespace = namespaces.find(
        (namespace) => namespace.title === namespaceTitle,
      );
      getNamespaceChats(mainNamespace.href);

      let activeSidebarCategoriesItem = document.querySelector(
        '.sidebar__categories-item.sidebar__categories-item--active',
      );

      activeSidebarCategoriesItem.classList.remove(
        'sidebar__categories-item--active',
      );

      e.currentTarget.classList.add('sidebar__categories-item--active');

      let categoryName = e.currentTarget.dataset.categoryName;
      let selectedCategory = document.querySelector(
        `.data-category-${categoryName}`,
      );
      let selectedCategoryActive = document.querySelector(
        `.sidebar__contact.sidebar__contact--active`,
      );
      selectedCategoryActive.classList.remove('sidebar__contact--active');
      selectedCategory.classList.add('sidebar__contact--active');
    });
  });
};

export const getNamespaceChats = (namespaceHref) => {
  if (namespaceSocket) {
    namespaceSocket.close();
  }
  namespaceSocket = io(`http://localhost:4003${namespaceHref}`, {
    withCredentials: true,
  });

  namespaceSocket.on('connect', () => {
    getMsg();
  });
  namespaceSocket.on('namespace:rooms', (room) => {
    showNamespaceChats(room);
  });
};

export const showNamespaceChats = (rooms) => {
  const chats = document.querySelector('.sidebar__contact-list');
  const chatStatus = document.querySelector('.chat__header-status');
  let onlineUserCounts = 1;
  chats.innerHTML = '';

  rooms.forEach((room) => {
    chats.insertAdjacentHTML(
      'beforeend',
      `
          <li class="sidebar__contact-item" data-room="${room._id}">
            <a class="sidebar__contact-link" href="#">
              <div class="sidebar__contact-left">
                <div class="sidebar__contact-left-left">
                  <img class="sidebar__contact-avatar" src="http://localhost:4003/${room.image}">
                </div>
                <div class="sidebar__contact-left-right">
                  <span class="sidebar__contact-title">${room.title}</span>
                  <div class="sidebar__contact-sender">
                    <span class="sidebar__contact-sender-name">Qadir Yolme :
                    </span>
                    <span class="sidebar__contact-sender-text">سلام داداش خوبی؟</span>
                  </div>
                </div>
              </div>
              <div class="sidebar__contact-right">
                <span class="sidebar__contact-clock">15.53</span>
                <span class="sidebar__contact-counter sidebar__counter sidebar__counter-active">66</span>
              </div>
            </a>
          </li>
      `,
    );
  });

  setClickOnChats();

  namespaceSocket.off('user:online');
  namespaceSocket.on('user:online', (count) => {
    onlineUserCounts = count;
    chatStatus.innerHTML = `${onlineUserCounts} Users online`;
  });
  namespaceSocket.on('isTyping', (data) => {
    console.log(data);
    chatStatus.innerHTML = !data.isTyping
      ? `${onlineUserCounts} Users online`
      : `${data?.name} typing...`;
  });
};
const setClickOnChats = () => {
  const chats = document.querySelectorAll('.sidebar__contact-item');
  chats.forEach((chat) => {
    chat.addEventListener('click', () => {
      console.log();
      document.querySelector('.chat__content-bottom-bar-input').value = '';
      const roomId = chat.dataset.room;
      currentRoomId = roomId;
      namespaceSocket.emit('room:join', roomId);

      const chatsContainer = document.querySelector('.chat__content-main');

      chatsContainer.innerHTML = '';
      namespaceSocket.off('room:info');
      namespaceSocket.on('room:info', (roomInfo) => {
        const chatHeader = document.querySelector('.chat__header');
        chatHeader.classList.add('chat__header--active');

        const chatContent = document.querySelector('.chat__content');
        chatContent.classList.add('chat__content--active');

        const chatName = document.querySelector('.chat__header-name');
        chatName.innerHTML = roomInfo.title;

        const chatAvatar = document.querySelector('.chat__header-avatar');
        chatAvatar.src = `http://localhost:4003/${roomInfo.image}`;
      });

      namespaceSocket.off('room:messages');
      namespaceSocket.on('room:messages', (messages) => {
        messages.forEach((msg) => {
          const isMine =
            msg?.sender?._id === userInfo.id || msg?.sender === userInfo.id;
          chatsContainer.insertAdjacentHTML(
            'beforeend',
            isMine
              ? `
            <div class="chat__content-receiver-wrapper chat__content-wrapper">
              <div class="chat__content-receiver">
                <span class="chat__content-receiver-text">${msg.message}</span>
                <span class="chat__content-chat-clock">17:55</span>
              </div>
            </div>
          `
              : `
            <div class="chat__content-sender-wrapper chat__content-wrapper">
              <div class="chat__content-sender">
                <span class="chat__content-sender-text">${msg.message}</span>
                <span class="chat__content-chat-clock">17:55</span>
              </div>
            </div>
          `,
          );
        });
      });
      const chatsContent = document.querySelector('.chat__content--active');
      if (chatsContent) chatsContent.scrollTo(0, chatsContent.scrollHeight);
    });
  });
  namespaceSocket.off('user:online');
  namespaceSocket.on('user:online', (count) => {
    document.querySelector('.chat__header-status').innerHTML =
      `${count} Users online`;
  });
};
export const sendMessage = () => {
  const msgInput = document.querySelector('.chat__content-bottom-bar-input');
  const chatsContent = document.querySelector('.chat__content--active');

  let isTyping = false;
  let typingTimer = null;

  msgInput.addEventListener('keyup', (event) => {
    const message = event.target.value.trim();

    if (message.length > 0 && !isTyping) {
      isTyping = true;
      namespaceSocket.emit('start:typing', {
        name: userInfo.name,
        id: userInfo.id,
        room: currentRoomId,
      });
    }

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      if (isTyping) {
        isTyping = false;
        namespaceSocket.emit('stop:typing', { room: currentRoomId });
      }
    }, 1500);

    if (event.keyCode === 13 && message.length) {
      namespaceSocket.emit('message:send', {
        message,
        currentRoomId,
      });

      msgInput.value = '';
      // chatsContent.scrollTo(0, chatsContent.scrollHeight);

      clearTimeout(typingTimer);
      if (isTyping) {
        isTyping = false;
        namespaceSocket.emit('stop:typing', { room: currentRoomId });
      }
    }
  });
};
export const getMsg = () => {
  console.log('GetMsg Function');
  // const chatsContent = document.querySelector(".chat__content--active");
  const chatsContainer = document.querySelector('.chat__content-main');

  namespaceSocket.off('confirmMsg');
  namespaceSocket.on('confirmMsg', (data) => {
    console.log();
    console.log('New Msg ->', data);
    if (userInfo.id === data.sender) {
      chatsContainer.insertAdjacentHTML(
        'beforeend',
        `
                <div class="chat__content-receiver-wrapper chat__content-wrapper">
                  <div class="chat__content-receiver">
                    <span class="chat__content-receiver-text">${data.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
            `,
      );
    } else {
      chatsContainer.insertAdjacentHTML(
        'beforeend',
        `
                <div class="chat__content-sender-wrapper chat__content-wrapper">
                  <div class="chat__content-sender">
                    <span class="chat__content-sender-text">${data.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
              `,
      );
    }

    // chatsContent.scrollTo(0, chatsContent.scrollHeight);
  });
};
