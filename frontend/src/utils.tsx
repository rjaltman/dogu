import { Component } from 'react';
export function mapOverMap<K, V, O>(m: Map<K, V>, f: (key: K, value: V) => O): O[] {
    let out: O[] = [];
    for(let pair of m) {
        let key: K = pair[0];
        let value: V = pair[1];
        out.push(f(key, value));
    }
    return out;
}
export async function post(url: string, payload: object): Promise<any> {
    let headers = {"Content-Type": "application/json"};
    let res = await fetch(url, {method: "POST", body: JSON.stringify(payload),
        credentials: "same-origin", headers});
    let jsonObj = await res.json();
    return jsonObj;
}

export async function get(url: string): Promise<any> {
    let res = await fetch(url, {method: "GET", credentials: "same-origin"});
    let jsonObj = await res.json();
    return jsonObj;
}

/*
 * This is a sneaky trick using the `name` property
 * of HTML `input` elements to tell React what they control 
 * without having to do any work. Very handy. Just set
 * the name of your `input`, set this as it's onChange listener,
 * and you're set.
 */
export function handleChange(this: Component, e: React.ChangeEvent<HTMLInputElement>) {
    const name: string = e.target.name;
    const value: string = e.target.value;
    this.setState({[name]: value});
}
