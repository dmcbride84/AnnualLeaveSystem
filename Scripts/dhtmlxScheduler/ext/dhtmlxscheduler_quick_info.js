scheduler.config.icons_select = ["icon_details", "icon_delete"];
scheduler.config.details_on_create = true;
scheduler.xy.menu_width = 0;

scheduler.attachEvent("onClick", function(id){
	scheduler.showQuickInfo(id);
	return true;
});

(function(){
	var events = ["onEmptyClick", "onViewChange", "onLightbox", "onBeforeEventDelete", "onBeforeDrag"];
	var hiding_function = function(){
		scheduler._hideQuickInfo();
		return true;
	};
	for (var i=0; i<events.length; i++)
		scheduler.attachEvent(events[i], hiding_function);
})();

scheduler.templates.quick_info_title = function(start, end, ev){ return ev.text.substr(0,50); };
scheduler.templates.quick_info_content = function(start, end, ev){ return ev.details || ev.text};
scheduler.templates.quick_info_date = function(start, end, ev){
	if (scheduler.is_one_day_event(ev))
		return scheduler.templates.day_date(start, end, ev) + " " +scheduler.templates.event_header(start, end, ev);
	else
		return scheduler.templates.week_date(start, end, ev);
};

scheduler.showQuickInfo = function(id){
	if (id == this._quick_info_box_id) return;
	this.hideQuickInfo(true);

	var pos = this._get_event_counter_part(id);
	if (pos){
		this._quick_info_box = this._init_quick_info(pos);
		this._fill_quick_data(id);
		this._show_quick_info(pos);
	}
};
scheduler._hideQuickInfo = function(){
	scheduler.hideQuickInfo();
}
scheduler.hideQuickInfo = function(forced){
	var qi = this._quick_info_box;
	this._quick_info_box_id = 0;

	if (qi && qi.parentNode){
		if (qi.style.right == "auto")
			qi.style.left = "-350px";
		else
			qi.style.right = "-350px";

		if (forced)
			qi.parentNode.removeChild(qi);
	}
};
dhtmlxEvent(window, "keydown", function(e){
	if (e.keyCode == 27)
		scheduler.hideQuickInfo();
});

scheduler._show_quick_info = function(pos){
	var qi = scheduler._quick_info_box;

	qi.style.top = this.xy.scale_height+this.xy.nav_height + 20 + "px";
	if (pos == 1){
		qi.style.right = "auto";
		qi.style.left = "-300px";
		
		setTimeout(function(){
			qi.style.left = "-10px";
		},1);
	} else {
		qi.style.left = "auto";
		qi.style.right = "-300px";
		
		setTimeout(function(){
			qi.style.right = "-10px";
		},1);
	}
	qi.className = qi.className.replace("dhx_qi_left","").replace("dhx_qi_left","")+" dhx_qi_"+(pos==1?"left":"right");

	scheduler._obj.appendChild(qi);
};
scheduler._init_quick_info = function(){
	if (!this._quick_info_box){
		var sizes = scheduler.xy;

		var qi = this._quick_info_box = document.createElement("div");
		qi.className = "dhx_cal_quick_info";
	//title
		var html = "<div class=\"dhx_cal_qi_title\" style=\"height:"+sizes.quick_info_title+"px\">"
			+ "<div class=\"dhx_cal_qi_tcontent\"></div><div  class=\"dhx_cal_qi_tdate\"></div>"
			+"</div>"
			+"<div class=\"dhx_cal_qi_content\"></div>";

	//buttons
		html += "<div class=\"dhx_cal_qi_controls\" style=\"height:"+sizes.quick_info_buttons+"px\">";
		var buttons = scheduler.config.icons_select;
		for (var i = 0; i < buttons.length; i++)
			html += "<div class=\"dhx_qi_big_icon "+buttons[i]+"\" title=\""+scheduler.locale.labels[buttons[i]]+"\"><div class='dhx_menu_icon " + buttons[i] + "'></div><div>"+scheduler.locale.labels[buttons[i]]+"</div></div>";
		html += "</div>";

		qi.innerHTML = html;
		dhtmlxEvent(qi, "click", function(ev){
			ev = ev || event;
			scheduler._qi_button_click(ev.target || ev.srcElement);
		});
	}

	return this._quick_info_box;
};

scheduler._qi_button_click = function(node){
	var box = scheduler._quick_info_box;
	if (!node || node == box) return;

	var mask = node.className;
	if (mask.indexOf("_icon")!=-1){
		var id = scheduler._quick_info_box_id;
		scheduler._click.buttons[mask.split(" ")[1].replace("icon_","")](id);
	} else
		scheduler._qi_button_click(node.parentNode);
};
scheduler._get_event_counter_part = function(id){
	var domEv = scheduler.getRenderedEvent(id);
	if(domEv)
		return (domEv.offsetLeft + domEv.clientWidth/2) > (scheduler._x/2) ? 1 : -1;
	return 0;
};

scheduler._fill_quick_data  = function(id){
	var ev = scheduler.getEvent(id);
	var qi = scheduler._quick_info_box;

	scheduler._quick_info_box_id = id;

//title content
	var titleContent = qi.firstChild.firstChild;
	titleContent.innerHTML = scheduler.templates.quick_info_title(ev.start_date, ev.end_date, ev);
	var titleDate = titleContent.nextSibling;
	titleDate.innerHTML = scheduler.templates.quick_info_date(ev.start_date, ev.end_date, ev);

//main content
	var main = qi.firstChild.nextSibling;
	main.innerHTML = scheduler.templates.quick_info_content(ev.start_date, ev.end_date, ev);
};
