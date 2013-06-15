(function( $, undefined ){

$.widget("smart-ui.combobox", {
	verson: "0.1",
	options: {
		items: [],
		textField: "",
		valueField: "",
		width: "150px",
		isEditable: false,
		isMultiSelect: false,
		defaultSelectValue: null,
		textFormatter: function(item){
			return item[this.textField];
		},
		disabled: false,
		
		// callbacks
		onSelect: null
	},
	
	_create: function(){
		var self = this;
		this._selectedItems = [];
		
		var domComboboxTextAndTrigger = "<div class='combobox-text-wrap'><table style='width: 100%;' cellspacing='0' cellpadding='0'><tr><td style='width:100%;'></td><td style='width:22px;'></td></tr></table></div>";

		var itemListHeight = this._calculateItemListHeight();
		this.itemListWrap = $("<div>")
			.addClass("combobox-itemlist-wrap")
			.css({
				//下拉列表与控件同宽
				width:self.options.width,
				height:itemListHeight
			});
		this.itemList = $("<ul>")
			.addClass("combobox-itemlist")
			.appendTo(this.itemListWrap);

		this.element.addClass("combobox-container")
			.css({width:this.options.width})
			.append(domComboboxTextAndTrigger)
			.append(this.itemListWrap);

		var textAndTriggerWrap = this.element.find(".combobox-text-wrap td");
		
		//初始化输入框		
		this.comboboxText = $("<input type='text'>")
			.addClass("combobox-text");
		if(!self.options.isEditable){
			this.comboboxText.attr("readonly", "readonly")
			.addClass("combobox-text-readonly")
			.focus(function(){
				$(this).blur();
			});
		}
		this.comboboxText.appendTo(textAndTriggerWrap.eq(0));
		
		textAndTriggerWrap.click(function(){
			if( self.options.disabled )
				return;

			if(self.itemListWrap.is(":hidden")){
				self.itemListWrap.show();
			}else{
				self.itemListWrap.hide();
			}
		});
		
		this._createItemList();
		
		//初始化下拉按钮(倒三角)
		this.comboboxTrigger = $("<div>")
			.addClass("combobox-trigger")
			.appendTo(textAndTriggerWrap.eq(1));

		this.document.bind("mousedown", function( event ){
			if( event.target == self.comboboxText.get(0) ||
				event.target == self.comboboxTrigger.get(0) )
				return;
				
			if( !$(event.target).closest(self.itemListWrap).length ){
				self.itemListWrap.hide();
			}
		});
		
		
	},
	
	/**
	  *构造数据内容
	  */
	_createItemList : function(){
		var self = this;
		var dataArray = self.options.items;
		if(dataArray != null && dataArray.length > 0){
			//获取默认选择的子项目
			var selectedValue = null;
			if(this.options.defaultSelectValue != null ){
			    if(this.options.defaultSelectValue instanceof Array){
					selectedValue = this.options.defaultSelectValue;
				}else{
					selectedValue = [this.options.defaultSelectValue];
				}

			}
		
			for(var i=0; i<dataArray.length; i++){
				var domItem = "<li value='" + dataArray[i][self.options.valueField] + "'>" + this.options.textFormatter(dataArray[i])  + "</li>";
				
				if( this._isInArray( selectedValue, dataArray[i][self.options.valueField] )){
					$(domItem).addClass("item-selected").appendTo(self.itemList);
					if(this.comboboxText.val() != null && this.comboboxText.val().length > 0){
						this.comboboxText.val(this.comboboxText.val() + ", " + this.options.textFormatter(dataArray[i]));
					}else{
						this.comboboxText.val(this.options.textFormatter(dataArray[i]));
					}
					self._addItem({value:dataArray[i][self.options.valueField], text:this.options.textFormatter(dataArray[i])});
					self._trigger( "onSelect", null, {item: $(domItem)});
				}else{
					$(domItem).appendTo(this.itemList);
				}
				
			}
			$(self.itemList).find("li")
			.click(function(event){
				if( self.options.disabled )
					return;
				
				var item = $(this);
				var originalValue = $(this).attr("value");
				var originalText = $(this).html();
				if(self.options.isMultiSelect && $(this).is(".item-selected")){
				
					$(this).removeClass("item-selected");
					
					var spliterBefore = ", " + originalText;
					var spliterAfter = originalText + ", " ;
					
					self.comboboxText.val( self.comboboxText.val().replace(eval("/"+spliterAfter+"|"+spliterBefore+"|"+originalText+"/"),"") )
					self._removeItem({value:originalValue, text:originalText});					
				}else if(self.options.isMultiSelect && !$(this).is(".item-selected")){
					$(this).addClass("item-selected");
					if(self.comboboxText.val() != null && self.comboboxText.val().length > 0){
						self.comboboxText.val(self.comboboxText.val() + ", " + originalText);
					}else{
						self.comboboxText.val(originalText);
					}
					self._addItem({value:originalValue, text:originalText});
				}else{
					$(self.itemList).find(".item-selected").removeClass("item-selected");
					$(this).addClass("item-selected");
					self.comboboxText.val(originalText);
					self._addItem({value:originalValue, text:originalText});
					self.itemListWrap.hide();
				}
				
				self._trigger( "onSelect", event, {item: item});

			})
			.mouseover(function(){
				$(this).addClass("item-over")
			})
			.mouseout(function(){
				$(this).removeClass("item-over")
			});
			
			this.itemListWrap.css({height:this._calculateItemListHeight()});
		}
	},
	
	_isInArray : function(ary, ele){
		for(var i=0; i<ary.length; i++){
			if(ary[i] == ele){
				return true;
			}
		}
		return false;
	},
	
	_addItem : function(item){
		if(!this.options.isMultiSelect){
			this._selectedItems = [];
		}
		this._selectedItems.push(item);
	},
	
	_removeItem : function(item){
		if(this.options.isMultiSelect){
			var self = this;
			$.each(this._selectedItems, function(i, ele){
				if(ele.value == item.value){
					self._selectedItems.splice(i,1);
					return false;
				}
			})
		}else{
			this._selectedItems = [];
		}
	},
	
	_calculateItemListHeight : function(){
		return this.options.items.length * 22 >= 180 ? 180 : this.options.items.length*22 + 2;
	},
	
	selectedItems : function(){
		return this._selectedItems;
	},
	
	selectedValues : function(){
		var values = []
		if(this._selectedItems.length > 0){
			for(var i=0; i<this._selectedItems.length; i++){
				var item = this._selectedItems[i];
				values.push(item.value);
			}
		}
		return values;
	},
	
	selectedValue : function(){
		if(!self.options.isMultiSelect && this._selectedItems.length == 1){
			return this._selectedItems[0].value;
		}
	},
	
	selectedItem : function(){
		if(!self.options.isMultiSelect && this._selectedItems.length == 1){
			return this._selectedItems[0];
		}
	},
	
	//选项设置操作
	select : function(values){
		var self = this;
		this.itemList.find(".item-selected").removeClass("item-selected");
		this.comboboxText.val("");
		this._selectedItems = [];
		
		$.each(this.itemList.find("li"),function(){
			if( self._isInArray( values, parseInt($(this).attr("value")) )){
				$(this).addClass("item-selected");
				
				var item = {};
				item[self.options.valueField] = parseInt($(this).attr("value"));
				item[self.options.textField] = $(this).text();
				
				if(self.comboboxText.val() != null && self.comboboxText.val().length > 0){
					self.comboboxText.val(self.comboboxText.val() + ", " + self.options.textFormatter(item));
				}else{
					self.comboboxText.val(self.options.textFormatter(item));
				}
				self._addItem({value:item[self.options.valueField], text:self.options.textFormatter(item)});
				self._trigger( "onSelect", null, {item: $(this)});
			}
		});
		
	},
	
	unSelect : function(values){
		var self = this;
		$.each(this.itemList.find("li.item-selected"),function(){
			if( self._isInArray( values, parseInt($(this).attr("value")) )){
				$(this).removeClass("item-selected");
				self._removeItem({value: parseInt($(this).attr("value"))});
				var originalText = $(this).text();
				var spliterBefore = ", " + originalText;
				var spliterAfter = originalText + ", " ;
				
				self.comboboxText.val( self.comboboxText.val().replace(eval("/"+spliterAfter+"|"+spliterBefore+"|"+originalText+"/"),"") );
			}
		});
	},
	
	clearSelected : function(){
		this._selectedItems = [];
		this.comboboxText.val("");
		this.itemList.find(".item-selected").removeClass("item-selected");
	},
	
	//选项的维护方法，重新设值，增加选项，移除选项，清空所有选项
	setItems : function(items){
		this.options.items = items;
		this._selectedItems = [];
		this.itemList.empty();
		this.comboboxText.val("");
		this._createItemList();
	},
	
	addItems : function(items){
	
	},
	
	removeItems : function(items){

	},
	
	clearItems : function(){
		this.options.items = [];
		this._selectedItems = [];
		this.itemList.empty();
		this.comboboxText.val("");
		this.itemListWrap.css({height:this._calculateItemListHeight()});
	}
	

});

}( jQuery ));
