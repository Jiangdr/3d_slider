/**
 * Created by px on 2017/3/28.
 */

var slide3d = (function () {
    var slideFn = function () {}
    $.extend(slideFn.prototype, {
        init : function (id, op) {
            var self = this,
                ul = id + ">ul",
                li = ul + ">li";
            self.wrap = $(id);
            self.ul = $(ul);
            self.li = $(li);
            self.Max = self.li.length;
            self.width = self.wrap.width();
            self.active = op.idx;//记录当前下标
            self.slide = true;
            self.current = self.width * self.active * -1;
            self.lateZ = 300, self.deg = 150, self.lateValArr = [], self.activeDeg = 0;
            self.li.css("width" ,self.width + "px");
            self.ul.css("width" ,self.width * self.Max + "px");
            self.ul.css({
                transform: "translate3d(" + self.current + "px, 0px, 0px)"
            })
            self.createElement().addEvent();
        },
        createElement : function () {
            var self = this,
                max = self.Max,
                li = self.li, lateZ = self.lateZ, deg = self.deg,
                act = self.active, lateValArr = [];
            for (var i = 0, j, degLi; i < max; i++){
                j = Math.abs(i - act) * -1 * lateZ;
                degLi = (i - act) * deg * -1;
                li.eq(i).css({
                    transform: "translate3d(0px, 0px, " + j + "px) rotateX(0deg) rotateY(" + degLi + "deg)",
                    zIndex: 1
                })
                lateValArr[i] = j;
            }
            self.lateValArr = lateValArr;
            self.wrap.append("<div class='slide-btn'><span class='slide-left slideBtn'></span><span class='slide-right slideBtn'></span></div>");
            var div = $("<div class='slide-btn-dot'></div>").appendTo(self.wrap);
            $.each(self.li, function (idx, li) {
                if (idx == self.active){
                    div.append("<span class='slide-selected slide-dots'>");
                }else {
                    div.append("<span class='slide-dots'>");
                }
            })
            var self_child = self.wrap.children();
            self.dots = self_child.eq(2).children();
            self.btn = self_child.eq(1).children();
            return self;
        },
        addEvent : function () {
            var self = this,
                ul = self.ul,
                endX = self.current,
                li = self.li, lateValArr = [], activeDeg = 0,
                deg = self.deg, lateZ = self.lateZ;
            self.wrap.on({
                click : function (e, idx) {
                    e.stopPropagation();
                    var tar = $(e.target),
                        slideTo, dura = 400;
                    if (!self.slide){
                        return;
                    }
                    if (tar.hasClass("slide-dots")){
                        if (self.active > tar.index()){
                            slideTo = 0;
                        }else if (self.active < tar.index()){
                            slideTo = 1;
                        }else {
                            return;
                        }
                        tar.addClass("slide-selected").siblings().removeClass("slide-selected");
                        self.active = tar.index();
                        self.ulSlideFn(slideTo, dura);
                    }else if (tar.hasClass("slideBtn")){
                        slideTo = tar.index();
                        if (slideTo == 0 && self.active > 0){
                            self.active--;
                            self.changeDots();
                            self.ulSlideFn(slideTo, dura);
                        }else if(slideTo == 1 && self.active < self.Max - 1){
                            self.active++;
                            self.changeDots();
                            self.ulSlideFn(slideTo, dura);
                        }
                    }
                },
                mousedown : function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (e.button == 2){
                        return false;
                    }
                    var start = new Date(),
                        cur = self.current,
                        startX = e.pageX,
                        width = self.width, max = self.Max,
                        move = 0, downStatus = true, abs = 0, perc = 0,
                        tar = $(e.target), lateVal = 0, degVal = 0,
                        dotSlide = 0, active = self.active, select = null;
                    if (tar.hasClass("slide-dots") || tar.hasClass("slideBtn")){
                        return;
                    }
                    $(window).on({
                        "mousemove.win" : function (e) {
                            e.preventDefault();
                            downStatus = false;
                            var end = new Date(),
                                curX = e.pageX;
                            if (end - start > 16){
                                move = curX - startX;
                                endX = cur + move;
                                if (dotSlide !== Math.ceil(move / width - 0.5)){
                                    select = active - Math.ceil(move / width - 0.5);
                                    select = select > max - 1 ? max - 1 : select;
                                    select = select < 0 ? 0 : select;
                                    self.active = select;
                                    self.changeDots();
                                    dotSlide = Math.ceil(move / width - 0.5);
                                }
                                ul.css({
                                    transform: "translate3d(" + endX + "px, 0px, 0px)"
                                })
                                // degVal = move * deg / width * -1;
                                for (var i = 0; i < max; i++){
                                    abs = Math.abs(i - active);
                                    perc = (move * lateZ / width);
                                    degVal = (active - i - move / width) * deg;
                                    if (move > 0){
                                        if (i >= active){
                                            lateVal = abs * -1 * lateZ - perc;
                                        }else {
                                            lateVal = abs * -1 * lateZ + perc;
                                            if (lateVal >= 0){
                                                lateVal *= -1;
                                            }
                                        }
                                    }else {
                                        if (i < active){
                                            lateVal = abs * -1 * lateZ + perc;
                                        }else {
                                            lateVal = abs * -1 * lateZ - perc;
                                            if (lateVal >= 0){
                                                lateVal *= -1;
                                            }
                                        }
                                    }
                                    li.eq(i).css({
                                        transform: "translate3d(0px, 0px, " + lateVal + "px) rotateX(0deg) rotateY(" + degVal +"deg)",
                                        zIndex: 1
                                    })
                                    if (i == active){
                                        activeDeg = degVal;
                                    }
                                    lateValArr[i] = lateVal;
                                }
                                start = end;
                            }
                        },
                        "mouseup.win" : function (e) {
                            $(this).off(".win");
                            if (downStatus){
                                return;
                            }
                            self.current = endX;
                            var cur = endX,
                                max = self.Max,
                                dura = 200;
                            self.lateValArr = lateValArr;
                            self.activeDeg = activeDeg;
                            if (cur < width - width * max){
                                self.ulSlideFn(0, dura);
                                return;
                            }else if (cur > 0){
                                self.ulSlideFn(1, dura);
                                return;
                            }
                            for (var i = 0; i < max; i++){
                                var maxPosition = width * i * -1;
                                if (cur < maxPosition){
                                    continue;
                                }else if (cur === maxPosition){
                                    return;
                                }
                                if (cur > maxPosition + width / 2){
                                    self.ulSlideFn(0, dura);
                                }else {
                                    self.ulSlideFn(1, dura);
                                }
                                break;
                            }
                        }
                    })
                },
            })
        },
        ulSlideFn : function (to, dura) {
            var self = this,
                ul = self.ul, li = self.li,
                actNum = self.active,
                set = self.width, max = self.Max, deg = self.deg,
                cur = self.current, lateValArr = self.lateValArr, lateVal = lateValArr[actNum],
                endX = set * actNum * -1, activeDeg = self.activeDeg, degItem = 0,
                duration = dura, lateValItem = 0,
                interval = 15,
                speed = Math.ceil((cur - endX)/(duration/interval)),
                late = Math.floor(lateVal / (duration/interval));
            activeDeg = activeDeg - Math.ceil((activeDeg - deg / 2) / deg) * deg;
            var degVari = Math.ceil(activeDeg/(duration/interval));
            speed = speed === 0 ? -1 : speed;
            var t = setInterval(function() {
                self.slide = false;
                cur -= speed;
                lateVal -= late;
                activeDeg -= degVari;
                lateVal = lateVal > 0 ? 0 : lateVal;
                if (to == 0){
                    if (cur >= endX){
                        self.current = endX;
                        cur = endX;
                        activeDeg = 0;
                        clearInterval(t);
                        self.lateValArr = lateValArr;
                        self.slide = true;
                    }
                }else if(to == 1){
                    if (cur < endX){
                        self.current = endX;
                        cur = endX;
                        activeDeg = 0;
                        clearInterval(t);
                        self.lateValArr = lateValArr;
                        self.slide = true;
                    }
                }
                for (var i = 0; i < max; i++){
                    if (to == 0){
                        if (i < actNum){
                            lateValItem = lateVal - self.lateZ * Math.abs(i - actNum);
                        }else if (i > actNum){
                            lateValItem = self.lateZ * -1 * Math.abs(i - actNum) - lateVal;
                        }else {
                            lateValItem = lateVal;
                        }
                    }else {
                        if (i > actNum){
                            lateValItem = lateVal - self.lateZ * Math.abs(i - actNum);
                        }else if (i < actNum){
                            lateValItem = self.lateZ * -1 * Math.abs(i - actNum) - lateVal;
                        }else {
                            lateValItem = lateVal;
                        }
                    }
                    degItem = (actNum - i) * deg + activeDeg;
                    li.eq(i).css({
                        transform: "translate3d(0px, 0px, " + lateValItem + "px) rotateX(0deg) rotateY(" + degItem + "deg)",
                        zIndex: 0
                    })
                    lateValArr[i] = lateValItem;
                }
                ul.css({
                    transform: "translate3d(" + cur + "px, 0px, 0px)"
                })
            }, interval);
        },
        changeDots : function () {
            var self = this;
            self.dots.eq(self.active).addClass("slide-selected").siblings().removeClass("slide-selected");
        }
    })
    return {
        id : function (id, op) {
            new slideFn().init(id, op);
        }
    }
})();
slide3d.id("#slide-3d-wrap", {idx : 10})















































