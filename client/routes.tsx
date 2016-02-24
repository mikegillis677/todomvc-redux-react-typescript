import * as React from 'react';
import * as Router from 'react-router';
import { Route, IndexRoute } from 'react-router';

import App from './containers/App';
import EmptyFrame from './containers/EmptyFrame';
import NotFound from './containers/NotFound';

var routeMap = (
    <Route path="/" component={EmptyFrame}>
        <IndexRoute component={App}/>
        <Route path="*" component={NotFound} />
    </Route>
);

export default routeMap;
