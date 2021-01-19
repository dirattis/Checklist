import {getMenuForRole} from '../shared'

export const routerBeforeEach = (router, store, routes) => {

    router.beforeEach((to, from, next) => {
      
      if(to.path == '/' && store.state.user.token)
      next({ name: 'home'});

      if(to.matched.some(x => !x.meta.withoutAuthentication))
      {     
      
        if(!store.state.user.token)
            next({ name: 'login'});

        // let menus = getMenuForRole(routes, store.state.user.perfil);
        // let allowed = menus.some(menu => menu === to.name);

        // if(!allowed && !to.query.showMessage)
        //     next({ name: 'home', params: { showMessage: true }
        //   });
        
        next();
      }
      else{
        next();
      }
  });
    
}