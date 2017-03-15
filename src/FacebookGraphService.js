require('dotenv').config();
import Ora from "../node_modules/ora";
import Promise from "../node_modules/promise";
import FacebookGraph from "../node_modules/fbgraph";

import User from "./User";
import Post from "./Post";

const spinner = Ora();
FacebookGraph.setAccessToken(process.env.ACCESS_TOKEN);

export default class FacebookGraphService {
    static getUsers(url) {
        return new Promise(function (resolve, reject) {
            let users = [];

            spinner.text = "Fetching members.";
            spinner.start();

            FacebookGraph.get(url, function (err, response) {
                if (err === null) {
                    if (response.data.length) {

                        response.data.forEach(function (user) {
                            users.push(new User(user.name));
                        });

                        if (response.paging && response.paging.next) {
                            const promise = FacebookGraphService.getUsers(response.paging.next);
                            promise.then(function (response) {
                                users = _.concat(users, response);
                                spinner.stop();
                                resolve(users);
                            });
                        } else {
                            spinner.stop();
                            resolve(users);
                        }
                    } else {
                        resolve(users);
                    }
                } else {
                    spinner.stop();
                    reject(err);
                }
            });
        });
    }

    static getPosts(url) {
        return new Promise(function (resolve, reject) {
            let posts = [];

            spinner.text = "Fetching posts.";
            spinner.start();

            FacebookGraph.get(url, function (err, response) {
                if (err === null) {
                    if (response.data.length) {

                        response.data.forEach(function (post) {
                            posts.push(new Post(
                                (post.hasOwnProperty("message")) ? post.message : "",
                                (post.hasOwnProperty("story")) ? post.story : "",
                                post.updated_time
                            ));
                        });

                        if (response.paging && response.paging.next) {
                            const promise = FacebookGraphService.getPosts(response.paging.next);
                            promise.then(function (response) {
                                posts = _.concat(posts, response);
                                spinner.stop();
                                resolve(posts);
                            });
                        } else {
                            spinner.stop();
                            resolve(posts);
                        }
                    } else {
                        resolve(posts);
                    }
                } else {
                    spinner.stop();
                    reject(err);
                }
            });
        });
    }
}