import './style.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({
  showSpinner: false
})

const getLocationPathname = () => {
  return new URL(location.href).pathname
}

const globalHistoryState = {
  value: history.state ? history.state : Object.assign({},{
    back: null,
    current: getLocationPathname(),
    forward: null,
    position: history.length - 1
  })
}

const elApp = document.querySelector('#app')
elApp.innerHTML = `
  <p>
    <a href="/about">Jump About</a>
  </p>
  
  <p>
  <a href="/user">Jump User</a>
  </p>
  <router-view></router-view>
  <p class="tip">💡 Please try use the browser go back key</p>
`;


const routes = [
  {
    path: '/',
    component: ``
  },
  {
    path: '/about',
    component: `<div>This is About</div>`
  },
  {
    path: '/user',
    component: `<div>This is User</div>`
  },
]

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const renderPushComponent = async (options = {}) => {

  const { beforeEach, afterEach, pathname } = Object.assign({}, {
    beforeEach: async () => {},
    afterEach: async () => {},
    pathname: getLocationPathname()
  }, options)
  
  NProgress.start()

  await beforeEach()
  
  const currentRoute = routes.find(
    (routeItem) => {
      return routeItem.path === pathname
    }
  )
  const routerView = elApp.querySelector('router-view')
  const componentHTML = currentRoute?.component
  if (componentHTML) {
    routerView.innerHTML = componentHTML
  } else {
    routerView.innerHTML = '{}'
  }


  const nextState = {
    back: history.state.current,
    current: pathname,
    forward: null,
    position: history.state.position + 1
  }
  
  history.pushState(nextState, '', pathname)
  globalHistoryState.value = nextState

  NProgress.done()
  
  await afterEach()
}
const initComponent = async (options = {}) => {

  const { beforeEach, afterEach, needReplace, pathname } = Object.assign({}, {
    beforeEach: async () => {},
    afterEach: async () => {},
    needReplace: true,
    pathname: getLocationPathname()
  }, options)
  
  NProgress.start()

  await beforeEach()
  
  const currentRoute = routes.find(
    (routeItem) => {
      return routeItem.path === pathname
    }
  )
  const routerView = elApp.querySelector('router-view')
  const componentHTML = currentRoute?.component
  if (componentHTML) {
    routerView.innerHTML = componentHTML
  } else {
    routerView.innerHTML = '{}'
  }

  if (needReplace) {
    history.replaceState(globalHistoryState.value, '', pathname)
  } else {
    const delta = history.state.position - globalHistoryState.value.position

    delta < 0
      ? (
        history.replaceState(Object.assign(history.state, {
          forward: globalHistoryState.value.current,
        }), '', pathname)
      )
      : (
        history.replaceState(Object.assign(history.state, {
          back: globalHistoryState.value.current,
        }), '', pathname)
      )
      
  }

  NProgress.done()
  
  await afterEach()
  globalHistoryState.value = history.state
}


const registerPopState = async (options = {}) => {

  window.addEventListener('popstate', ({ state }) => {
    console.log(JSON.stringify(state))

    initComponent({
      needReplace: false,
      async beforeEach() {
        await sleep(1000)
      }
    })
  })

}


window.addEventListener('click', (event) => {
  if (event.target.localName !== 'a') return
  event.preventDefault()
  
  const aLink = event.target
  const url = new URL(aLink.href)

  const { pathname } = url
  if (pathname === getLocationPathname()) return
  
  renderPushComponent({
    pathname,
    async beforeEach() {
      await sleep(1000)
    }
  })
})

const onAppLoad = () => {
  registerPopState()
  initComponent()
}
onAppLoad()