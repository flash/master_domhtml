
(function (rr) {
	// 'use strict';

	var u, badIE = '\v'=='v' && document.createElement('span').style.opacity === u; // badIE = IE<9

	// алиасы для параметров чтоб походили на имя атрибута
	var attr_alias = {cellspacing: 'cellSpacing', cellpadding: 'cellPadding', colspan: 'colspan', rowSpan: 'rowSpan'};

	rr.new_master = function (d, ns) {

		function master(nn, q) {
			if (nn === 'text') return d.createTextNode(q); // в ж. этот функционал . нужно использовать _.text("eeeeee")
			if (!nn) return;

			var tag, a, u, l = arguments.length
			, params = false
			, arg_length = arguments.length
			, is_append // второй аргумент (q) это не параметр
			, is_group // флаг что это группа (nodeType < 0)
			, i, x, id, css, pn, sx, v
			;

			if (q) {
				is_append = true;

				if (!q.nodeType && typeof q == 'object') {
					if (q.length === u || !isArray(q)) {
						params = q;

						arguments[1] = q = params.add; // params.add - призрак прошлого. вырезаю из кода
						if (q === u) is_append = u;
					};
				};
			} 
			else {
				is_append = q === 0 || q === '';
			};


			// create element
			switch (nn) {
				case 'body':
					nn = d.body;
					break;

				case 'DocumentFragment':
					nn = d.createDocumentFragment();
					params = false;
					break;

				case 'div': case 'li': case 'br': case 'span': case 'a': case 'td': case 'abbr':
					nn = d.createElement(tag = nn);
					break;

				default:
					i = typeof nn;
					if (i !== 'string') {
						if (i === 'function') {
							if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
							nn = new nn(this, params, false);

							i = nn.nodeType;
							is_group = i < 0;
							if (!is_group) params = false;
						} else {
							i = nn.nodeType;
							is_group = i < 0;
						};
						
						if (!i) return nn;
						break;
					} ;

					i = nn.indexOf(':');
					if (is_group = i !== -1) {
						nn = create_group(i ? nn.substring(0, i) : 'default', nn.substring(++i), params || false, d, ns, master);
						if (!nn || !(i=nn.nodeType)) return nn;

						is_group = i < 0;
						if (!is_group) params = false;
						break;
					};

					// tag.className#idNode
					i = nn.indexOf('#');
					if (i > 0) {
						id = nn.substring(i + 1);
						x = i;
					} else {
						x = u;
					};

					i = nn.indexOf('.');
					if (i > 0) {
						css = x ? nn.substring(i + 1, x) : nn.substring(i + 1);
						x = i;
					};

					if (x) nn = nn.substring(0, x);

					nn = (tag = nn) === 'body' ? d.body 
						: d.createElement(nn);
			};

			
			// set params
			if (params) {
				if (is_group) {
					// nn._set_parameters - дает право мастеру изменянять значения через функцию set({key: value, ...})
					if (nn._set_parameters === true && typeof nn.set == 'function') {
						nn.set(params);
					};
				} 
				else {
					for (x in params) {
						v = params[x];
						if (v === u) continue;
						
						if (i = attr_alias[x]) { // алиасы для параметров чтоб походили на имя атрибута
							nn[x] = v; 
							continue;
						};

						switch (x) {
							//case 'text': if (v || v === '' || v === 0) nn.appendChild(d.createTextNode(v));   
							case 'text':
								if (v || v === '' || v === 0) {
									if (tag !== 'option' || badIE) {
										nn.appendChild(d.createTextNode(v));
									} 
									else {
										nn.text = v;
									};
								};
								break;

							case 'id':
								if (v) id = v;
								break;

							case 'class': case 'css': case 'className':
								if (v) css = css ? css + ' ' + v : v;
								break;

							case 'style':
								// style_set(nn, v) для совместимости. но пока не удаляю
								typeof v === 'string' ? nn.style.cssText = v : v && style_set(nn, v);
								break;

							case 'href':
								/*  буду считать что master создан только для генерации элемента. буду ждаь ошибки
								if (badIE && v && v.indexOf('@') !== -1) {
									// иногда всплывает ошибка. это несовсем удачное решение  
									// проблему нужно сново пересмотреть, как только она вcплывет снова
									v = v.replace(/@/g, '%40');
								};
								*/

								nn.href = v;
								break;

							case 'add': case 'parent': case 'before': case 'after':
								break;

							default:
								if (badIE)  { // есть косяк в IE . через параметр обьекта неработает
									if (tag === 'button' || tag === 'input') {
										nn.setAttribute(x, i);
										continue;
									};
								}; 


								// '~/nameattr' или '/nameattr' вот в чем вопрос
								if (x.indexOf('~/') === 0) {
									if (x = x.substr(2)) nn.setAttribute(x, i);
								} else {
									nn[x] = v; 
								};
						};
					};
				};
			};

			if (!is_group) { // params
				if (css) nn.className = css;
				if (id) nn.id = id;
			};



			// append child . тут снос крыши :)
			i = is_append ? 1 : 2;
			if (i < arg_length) {
				pn = nn;

				if (is_group && typeof nn.appendChild !== 'function') {
					pn = nn.box || nn.node;
					if (!pn) arg_length = u;
				} else {
					sx = is_group; // магия бля
				};

				while (i < arg_length) {
					if (a = arguments[i++]) {
						x = a.nodeType;
						if (x > 0) {
							pn.appendChild(a);
							continue;
						}
						if (x < 0) {
							if (sx) {
								pn.appendChild(a)
							} 
							else if (a = a.node) {
								pn.appendChild(a);
							};
							continue;
						}
					}

					switch (typeof a) {
						case 'number':
							if (a !== a) break;
						case 'string':
							//try {
							pn.appendChild(d.createTextNode(a));
							//} catch (e) {alert(pn);throw e};
							break;

						case 'object':
							if (isArray(a)) {
								append(pn, a, d, sx);
							};
					};
				};
			};


			return params ? params.parent || params.after || params.before ? insert(nn, params, is_group) : nn : nn;
		};

		d = d ? d.ownerDocument || d : document;

		master.global = ns || (ns = {});
		master.document = d;

		master.text = text;
		master.html = html;

		master.clone = clone;
		master.tmpl = tmpl;
		master.map = master.forEach = map;

		return master;
	};


	var isArray = Array.isArray || new function (o) {
		var x = Object.prototype.toString, s = x.call([]);
		return function (o) {
			return x.call(o) === s
		}
	};


	function text(x) {
		return this.document.createTextNode(x || (x === 0 ? 0 : ''))
	}

	var N2A;
	try {
		N2A = Array.prototype.slice.call(document.documentElement.childNodes) instanceof Array
	} catch (e) { }

	function html(x) {
		var n = this.nullNode || (this.nullNode = this.document.createElement('div')), a, i;
		n.innerHTML = x;
		n = n.childNodes;

		if (i = n.length) {
			if (N2A) return Array.prototype.slice.call(n);

			for (a = []; i--; ) a[i] = n[i];
			return a
		}
	}

	function insert(nn, p, is_group) {
		var x, a, ip, ib, pn, i;

		if (is_group) {
			if (x = p.parent) {
				if (i = x.nodeType) {
					if (i < 0 && x.appendChild) {
						x.appendChild(nn)
					}
					else {
						x = i < 0 ? x.box || x.node : x;
						pn = nn.nodeType < 0 ? nn.node : nn
						if (x && pn) x.appendChild(pn);
					}
				}
			}
			return nn;
		}

		// insert
		if (a = p.after) {
			ib = a.nextSibling;
			if (!ib) ip = a.parentNode;
		};

		if (a = p.parent || ip)
			return a.appendChild(nn);

		if (a = p.before || ib)
			return a.parentNode.insertBefore(nn, a);

		return nn;
	}


	function append(nn, m, d, s) {
		var i = 0, l = m.length, a, x;

		while (i < l) {

			if (a = m[i++]) {
				x = a.nodeType;

				if (x > 0) {
					nn.appendChild(a);
					continue;
				}

				if (x < 0) {
					if (s) {
						nn.appendChild(a)
					} else if (a = a.node) nn.appendChild(a);
					continue;
				}
			}

			switch (typeof a) {
				case 'number':
					if (a !== a) break;
				case 'string':
					nn.appendChild(d.createTextNode(a));
					break;

				case 'object':
					if (isArray(a)) append(nn, a, d, s);
			}
		}
	}

	function clone(doc) {
		var c = rr.new_master(doc||this.document, this.global);
		return c;
	};

	/*
	ui - name ui || ui element
	pr - set parament
	doc - document
	ns - local name space
	master - constructor element
	*/

	//var _nullprm = {};
	function create_group(tp, ui, pr, d, gs, master) {
		var ns = gs[tp], c, u;

		if (!ui || !ns) return false;

		if (c = ns[ui]) {

			if (typeof c === 'function') {
				if (!c.prototype.nodeType) c.prototype.nodeType = -1;
				ui = new c(master, pr ); //, {name: ui, type: tp, document: d, uiclass: c}
				return ui;
			}
		};
	};

	// эксперементальный функционал. 
	function tmpl(nn, p) {
		switch (typeof nn) {
			case 'function':
				if (!nn.prototype.nodeType) nn.prototype.nodeType = -1;
				return new nn(this, p);

			case 'string': break;
			default: return;
		};

		var x = nn.indexOf(':'), ns = this.global[nn.substring(0, x)], c;
		if (!ns) return;

		c = ns[nn.substring(x+1)];

		if (typeof c === 'function') {
			if (!c.prototype.nodeType) c.prototype.nodeType = -1;
			if (nn = new c(this, p)) {
				return nn;
			};
		};
	};


	// 
	function map(a, func) {
		if (!a || typeof func !== 'function') {
			return;
		};

		if (typeof a === 'number') {
			a = {length: a};
		};

		var l = a.length
		, i = 0
		, iend = l - 1
		, m = []
		, e = {first: true, last: false, list: a} //, master: this
		, v, u
		;


		for (; i < l; i++) {
			if (i === iend) e.last = true;
			e.index = i;

			v = func(a[i], e, this);

			if (v || v === 0 || v === '') {
				m.push(v)
			};

			if (!i) e.first = false;
		}

		return m;
	};


	// совместимость с прошлым
	function style_set(n, pr) {
		var st = n.style, x, a, und;

		x = pr.cssText;
		if (x || x === '') st.cssText = x;

		if (badIE) {
			x = pr.opacity;

			if (x || x === 0 || x === '') {
				if (a = typeof n.filters !== 'object' ? null : n.filters['DXImageTransform.Microsoft.alpha'] || n.filters.alpha) {
					if (a.enabled = x !== '') a.opacity = Math.round(x * 100);
				}
				else if (x !== '') {
					st.filter += 'alpha(opacity=' + Math.round(x * 100) + ')';
				};
			};
		};

		for (x in pr) {
			if (x !== 'cssText') {
				st[x] = pr[x];
			};
		};
	};

})(this.rr);

