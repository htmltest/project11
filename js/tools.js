var speedSlider  = 500;     // скорость смены слайда на главной странице
var periodSlider = 2500;    // период автоматической смены слайда на главной страницы ("0" - автоматическая смена отключена)

var timerSlider  = null;

var speedScroll  = 500;     // скорость скроллинга по форме заказа

var availableCities = [
    'Москва',
    'Санкт-Петербург',
    'Волгоград',
    'Воронеж',
    'Иваново',
    'Калининград',
    'Калуга',
    'Нижний Новгород',
    'Хабаровск'
];

(function($) {

    $(document).ready(function() {

        // слайдер
        $('.slider').each(function() {
            var curSlider = $(this);
            curSlider.data('curIndex', 0);
            curSlider.data('disableAnimation', true);
            if (periodSlider > 0) {
                timerSlider = window.setTimeout(sliderNext, periodSlider);
            }
        });

        $('.slider').hover(
            function() {
                window.clearTimeout(timerSlider);
                timerSlider = null;
            },

            function() {
                if (periodSlider > 0) {
                    timerSlider = window.setTimeout(sliderNext, periodSlider);
                }
            }
        );

        // пример открытия окна при нажатии на фото на странице продукта
        $('.product-side .catalogue-item-photo a, .product-side .catalogue-item-name a').click(function() {
            windowOpen($('.product-window').html());
            return false;
        });

        // быстрый заказ
        if ($('.product-quick').length > 0) {
            $('.product-side-order-link a').click(function() {
                $('.product-quick').stop(true, true);
                if ($('.product-quick:visible').length == 1) {
                    $('.product-quick').stop().fadeOut();
                } else {
                    $('.product-quick').stop().show().css({'left': 252, 'opacity': .5}).animate({'left': 202, 'opacity': 1}, 300);
                }
                return false;
            });

            $('.product-quick-close, .product-quick-window-cancel a').click(function() {
                $('.product-quick').fadeOut();
                return false;
            });

            $(document).click(function(e) {
                if ($(e.target).parents().filter('.product-quick').length == 0) {
                    $('.product-quick').fadeOut();
                }
            });

            $('.product-quick-form form').validate({
                messages: {
                    name: 'Это обязательное поле!',
                    phone: 'Это обязательное поле!'
                }
            });
        }

        // пример открытия окна при нажатии на "В корзину"
        $('.catalogue-item-buy a').live('click', function() {
            var curLink = $(this);
            var curItem = curLink.parent().parent().parent();
            if (!curLink.hasClass('incart')) {
                var curText = curLink.attr('rel');
                curLink.attr('rel', curLink.html());
                curLink.html(curText);
                curLink.addClass('incart');
                if ($('.window').length == 0) {
                    windowOpen($('.incart-window').html());
                }
            }
            return false;
        });

        // раскрытие корзины
        $('.header-cart-full').hover(
            function() {
                $('.header-cart-content').stop().show().css({'top': 115, 'opacity': .5}).animate({'top': 65, 'opacity': 1}, 300);
                return false;
            },

            function() {
                $('.header-cart-content').stop().hide();
                return false;
            }
        );

        // выбор количества в корзине
        $('.cart-count-select div').click(function() {
            $('.cart-count-select-open').removeClass('cart-count-select-open');
            $(this).parent().addClass('cart-count-select-open');
        });

        $('.cart-count-select ul li').click(function() {
            var curOption = $(this);
            var curSelect = curOption.parent().parent();
            curSelect.find('input').val(curOption.attr('rel'));
            curSelect.find('div').html(curOption.attr('rel'));
            curSelect.find('li.active').removeClass('active');
            curOption.addClass('active');
            curSelect.removeClass('cart-count-select-open');
            var curItem = curSelect.parents().filter('.cart-row');
            if (curItem.find('.cart-discount-value:visible').length == 1) {
                curItem.find('.cart-cost span').eq(0).html((Number(curItem.find('.cart-price span').html()) - Number(curItem.find('.cart-discount-value span').html())) * Number(curOption.attr('rel')));
            } else {
                curItem.find('.cart-cost span').eq(0).html(Number(curItem.find('.cart-price span').html()) * Number(curOption.attr('rel')));
            }
            recalcCost();
        });

        $(document).click(function(e) {
            if ($(e.target).parents().filter('.cart-count-select').length == 0) {
                $('.cart-count-select-open').removeClass('cart-count-select-open');
            }
        });

        // удаление позиции из корзины
        $('.cart-delete a').click(function() {
            $(this).parents().filter('.cart-row').slideUp(function() {
                $(this).remove();
                recalcCost();
            });
            return false;
        });

        // форма авторизации
        $('.order-user-input input').each(function() {
            if ($(this).val() == '') {
                $(this).parent().find('span').css({'display': 'block'});
            }
        });

        $('.order-user-input input').focus(function() {
            $(this).parent().find('span').css({'display': 'none'});
        });

        $('.order-user-input input').blur(function() {
            if ($(this).val() == '') {
                $(this).parent().find('span').css({'display': 'block'});
            }
        });

        // окно восстановления пароля
        $('.order-user-row-link-forgot').click(function() {
            windowOpen($('.window-email').html());

            $('.window .window-email-cancel a').bind('click', function() {
                windowClose();
                return false;
            });

            $('.window .window-email-error-link a').bind('click', function() {
                windowClose();
                return false;
            });

            $('.window .window-email-form form').bind('submit', function() {
                if ($('.window .window-email-input input').val() == 'ivanova.inna@yundex.ru') {
                    $('.window .window-email-form').hide();
                    $('.window .window-email-success span').html($('.window .window-email-input input').val());
                    $('.window .window-email-success').show();
                } else {
                    $('.window .window-email-form').hide();
                    $('.window .window-email-error-text span').html($('.window .window-email-input input').val());
                    $('.window .window-email-error').show();
                }
                return false;
            });

            return false;
        });

        // форма заказа
        $('.order-form-hint').each(function() {
            $(this).css({'margin-top': -($(this).height() + 15) / 2});
        });

        $('.order-form').each(function() {
            $('.order-form form').validate({
                messages: {
                    name: 'Это обязательное поле!',
                    email: 'Это обязательное поле!',
                    city: 'Это обязательное поле!',
                    address: 'Вы забыли указать адрес!<br />Куда доставить ваш заказ?'
                },
                invalidHandler: function(form, validator) {
                    validator.showErrors();
                    if ($('.order-form form .error:first').length > 0) {
                        $('.order-form-steps').data('scrollAnimation', true);
                        $.scrollTo('.order-form form .error:visible:first', {offset: {'top': -92}, duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                    }
                },
                submitHandler: function(form) {
                    var curStep = $('.order-steps li').index($('.order-steps li.curr'));
                    switch(curStep) {
                        case 0:
                            $('.order-steps li').removeClass('curr');
                            $('.order-steps li').eq(0).addClass('prev');
                            $('.order-steps li').eq(1).addClass('prev curr');
                            $('.order-form-next').before('<div class="order-form-group" style="display:none;">' + $('#order-form-delivery').html() + $('#order-form-delivery-moscow').html() + '</div>');

                            $('.order-form form .order-form-select div').click(function() {
                                $('.order-form-select-open').removeClass('order-form-select-open');
                                $(this).parent().addClass('order-form-select-open');
                            });

                            $('.order-form-select ul li').click(function() {
                                var curOption = $(this);
                                var curSelect = curOption.parent().parent();
                                curSelect.find('input').val(curOption.attr('rel'));
                                curSelect.find('div').html(curOption.html());
                                curSelect.find('li.active').removeClass('active');
                                curOption.addClass('active');
                                curSelect.removeClass('order-form-select-open');
                                if (curOption.attr('rel') == 1) {
                                    $('.order-form form .order-form-group-delivery-list:first').html($('#order-form-delivery-moscow .order-form-group-delivery-list').html());
                                } else {
                                    $('.order-form form .order-form-group-delivery-list:first').html($('#order-form-delivery-other .order-form-group-delivery-list').html());
                                }
                                if (curOption.attr('rel') == 0) {
                                    $('.order-form form .order-form-row-other').slideDown();
                                } else {
                                    $('.order-form form .order-form-row-other').slideUp();
                                }
                            });

                            $(document).click(function(e) {
                                if ($(e.target).parents().filter('.order-form-select').length == 0) {
                                    $('.order-form-select-open').removeClass('order-form-select-open');
                                }
                            });

                            $('.order-form-next').prev().slideDown(function() {
                                $('.order-form-steps').data('scrollAnimation', true);
                                $.scrollTo('.order-form form .order-form-group:last', {duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                            });
                            break;
                        case 1:
                            $('.order-steps li').removeClass('curr');
                            $('.order-steps li').eq(1).addClass('prev');
                            $('.order-steps li').eq(2).addClass('prev curr');
                            $('.order-form-next').before('<div class="order-form-group" style="display:none;">' + $('#order-form-pay').html() + '</div>');
                            $('.order-form-next').prev().find('.order-form-group-delivery-list').css({'display': 'block'});
                            $('.order-form-next').prev().slideDown(function() {
                                $('.order-form-steps').data('scrollAnimation', true);
                                $.scrollTo('.order-form form .order-form-group:last', {duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                            });
                            break;
                        case 2:
                            $('.order-steps li').removeClass('curr');
                            $('.order-steps li').eq(2).addClass('prev');
                            $('.order-steps li').eq(3).addClass('prev curr');
                            $('.order-form-next').before('<div class="order-form-group" style="display:none;">' + $('#order-form-confirm').html() + '</div>');
                            $('.order-form-next').prev().slideDown(function() {
                                $('.order-form-steps').data('scrollAnimation', true);
                                $.scrollTo('.order-form form .order-form-group:last', {duration: speedScroll, onAfter: function() { $('.order-form-steps').data('scrollAnimation', false); }});
                                $('.order-form-next').fadeOut(function() { $('.order-form-next').remove(); } );
                            });
                            break;
                        case 3:
                            form.submit();
                            break;
                    }
                }
            });
        });

        window.setInterval(function() {
            $('.order-form-input label:visible').each(function() {
                $(this).css({'margin-top': -($(this).height() + 15) / 2});
            });
        }, 10);

        $('.order-delivery-radio input:checked').parent().parent().parent().addClass('active checked');

        $('.order-form form .order-delivery-item').live('click', function() {
            var curItem = $(this);
            if (!curItem.hasClass('checked')) {
                var curGroup = curItem.parent();
                curGroup.find('.order-delivery-item').stop(true, true);

                curGroup.find('.order-delivery-item.checked').animate({'border-color': '#c8c8c8'});
                curGroup.find('.order-delivery-item.checked .order-delivery-item-inner').animate({'background-color': '#fff'});
                curGroup.find('.order-delivery-item.checked .order-delivery-radio').css({'background-position': 'left top'});
                curGroup.find('.order-delivery-item.checked .order-delivery-item-text').animate({'color': '#76655e'});
                curGroup.find('.order-delivery-item.checked .order-delivery-item-price').animate({'color': '#b69968'});

                curItem.animate({'border-color': '#e7e7e7'});
                curItem.find('.order-delivery-item-inner').animate({'background-color': '#f1efea'});
                curItem.find('.order-delivery-radio').css({'background-position': 'left -24px'});
                curItem.find('.order-delivery-item-text').animate({'color': '#7b6152'});
                curItem.find('.order-delivery-item-price').animate({'color': '#d14d0f'});

                curGroup.find('.order-delivery-item.checked').removeClass('checked');
                curItem.addClass('checked');

                curItem.find('input').prop('checked', true);
            }
        });

        if ($('.order-form').length == 1) {
            $('.order-steps li div').click(function() {
                var curStep = $(this).parent();
                if (curStep.hasClass('prev') || curStep.hasClass('curr')) {
                    var curIndex = $('.order-steps li').index(curStep);
                    $.scrollTo('.order-form form .order-form-group:eq(' + curIndex + ')', {offset: {'top': -92}, duration: speedScroll});
                }
            });
        }

        if ($('.order-form').length == 0) {
            $('.order-steps li div').css({'cursor': 'default'});
        }

        // окно авторизации
        $('.top-line-login a, .order-user-submit a').click(function() {
            windowOpen($('.login-window').html());
            return false;
        });

        $('.window .login-window-cancel a').live('click', function() {
            windowClose();
            return false;
        });

        $('.window .login-form-forgot-link a').live('click', function() {
            $('.window .login-form-forgot').show();
            recalcWindow();
            return false;
        });

        $('.window .login-form-sms').live('click', function() {
            if ($(this).parent().find('input').val() == '12FA') {
                $('.window .login-form-forgot-valid').show();
                recalcWindow();
            }
            return false;
        });

        // окно смены телефона
        $('.window .login-form-right-phone a').live('click', function() {
            windowClose();
            windowOpen($('.phone-window').html());
            return false;
        });

        $('input[name="phone"]').mask('8 (999) 999 99 99');

        // купон
        $('.cart-coupon-input input').focus(function() {
            $('.cart-coupon-input label').css({'display': 'none'});
        });

        $('.cart-coupon-submit a').click(function() {
            var curCoupon = $('.cart-coupon-input input').val();
            if (curCoupon == 'DR-ERTC-JOWE') {
                $('.cart-coupon-input .valid').css({'display': 'block'});
                $('.cart-discount').each(function() {
                    if ($(this).find('.cart-discount-value').length == 1) {
                        $(this).find('span').eq(0).hide();
                        $(this).find('.cart-discount-value').show();
                        var curItem = $(this).parents().filter('.cart-row');
                        if (curItem.find('.cart-discount-value:visible').length == 1) {
                            curItem.find('.cart-cost span').eq(0).html((Number(curItem.find('.cart-price span').html()) - Number(curItem.find('.cart-discount-value span').html())) * Number(curItem.find('.cart-count input').val()));
                        } else {
                            curItem.find('.cart-cost span').eq(0).html(Number(curItem.find('.cart-price span').html()) * Number(curItem.find('.cart-count input').val()));
                        }
                    }
                });
                recalcCost();
            } else {
                $('.cart-coupon-input .error').css({'display': 'block'});
            }
            return false;
        });

        $('.news-load-link a').live('click', function() {
            var curLink = $(this);
            curLink.parent().before('<div class="news-load"></div>');
            $('.news-load:last').load(curLink.attr('href'), function() {
                $('.news-load:last').slideDown();
                curLink.parent().remove();
            });
            return false;
        });

    });

    // переход к следующему слайду
    function sliderNext() {
        window.clearTimeout(timerSlider);
        timerSlider = null;

        var curSlider = $('.slider');
        if (curSlider.data('disableAnimation')) {
            var curIndex = curSlider.data('curIndex');
            var newIndex = curIndex + 1;
            if (newIndex == curSlider.find('ul li').length) {
                newIndex = 0;
            }

            curSlider.data('curIndex', newIndex);
            curSlider.data('disableAnimation', false);
            curSlider.find('ul li').eq(curIndex).fadeOut(speedSlider, function() {
                curSlider.find('ul li').eq(newIndex).fadeIn(speedSlider, function() {
                    curSlider.data('disableAnimation', true);
                    if (periodSlider > 0) {
                        timerSlider = window.setTimeout(sliderNext, periodSlider);
                    }
                });
            });
        }
    }

    // открытие окна
    function windowOpen(contentWindow) {
        var windowWidth  = $(window).width();
        var windowHeight = $(window).height();
        var curScrollTop = $(window).scrollTop();

        $('body').css({'width': windowWidth, 'height': windowHeight, 'overflow': 'hidden'});
        $(window).scrollTop(0);
        $('.wrapper').css({'top': -curScrollTop});
        $('.wrapper').data('scrollTop', curScrollTop);

        $('body').append('<div class="window"><div class="window-overlay"></div><div class="window-container">' + contentWindow + '<a href="#" class="window-close"></a></div></div>')
        recalcWindow();

        $('.window-overlay').click(function() {
            windowClose();
        });

        $('.window-close').click(function() {
            windowClose();
            return false;
        });

        $('body').bind('keypress keydown', keyDownBody);

        $('.window input[name="phone"]').mask('8 (999) 999 99 99');
    }

    // функция обновления позиции окна
    function recalcWindow() {
        var windowWidth  = $(window).width();
        var windowHeight = $(window).height();
        if ($('.window-container').width() < windowWidth) {
            $('.window-container').css({'margin-left': -$('.window-container').width() / 2});
        } else {
            $('.window-container').css({'left': 0});
        }
        if ($('.window-container').height() < windowHeight) {
            $('.window-container').css({'margin-top': -$('.window-container').height() / 2});
        } else {
            $('.window-container').css({'top': 20});
            $('.window-overlay').css({'min-height': $('.window-container').height() + 40});
        }
    }

    // обработка Esc после открытия окна
    function keyDownBody(e) {
        if (e.keyCode == 27) {
            windowClose();
        }
    }

    // закрытие окна
    function windowClose() {
        $('body').unbind('keypress keydown', keyDownBody);
        $('.window').remove();
        $('.wrapper').css({'top': 'auto'});
        $('body').css({'width': 'auto', 'height': '100%', 'overflow': 'auto'});
        var curScrollTop = $('.wrapper').data('scrollTop');
        $(window).scrollTop(curScrollTop);
    }

    // пересчет стоимости в корзине
    function recalcCost() {
        var curSumm = 0;
        var curCount = 0;
        $('.cart-row').each(function() {
            if (!$(this).hasClass('cart-row-coupon') && !$(this).hasClass('cart-row-discount') && !$(this).hasClass('cart-row-gift')) {
                curSumm += Number($(this).find('.cart-cost span').html());
                curCount += Number($(this).find('.cart-count input').val());
            }
        });
        if ($('.cart-row-discount').length == 1) {
            $('.cart-row-discount .cart-cost span').html('-' + Math.round(curSumm * (Number($('.cart-row-discount .cart-info-name span').html()) / 100)));
        }
        $('.cart-ctrl-summ-count').html(curCount);
        $('.cart-ctrl-summ-cost').html(curSumm - Math.round(curSumm * (Number($('.cart-row-discount .cart-info-name span').html()) / 100)));
    }

    // обработка скроллинга
    $(window).bind('load resize scroll', function() {
        if ($('.order-form').length == 1) {
            var curScroll = $(window).scrollTop();
            var curTopSteps = $('.order-steps').offset().top - 11;
            if (curTopSteps < curScroll) {
                $('.order-steps').addClass('order-steps-fixed');
                $('.side').addClass('side-fix');
                $('.side').css({'left': $('.middle').offset().left + $('.middle').width() - 236});
            } else {
                $('.order-steps').removeClass('order-steps-fixed');
                $('.side').removeClass('side-fix');
                $('.side').css({'left': 'auto'});
            }
        }
    });

    // выравнивание блоков в каталоге по высоте
    $(window).load(function() {
        $('.catalogue').each(function() {
            var curBlock = $(this);
            curBlock.find('.catalogue-item:nth-child(4n)').each(function() {
                var curItem   = $(this);
                var curIndex  = curBlock.find('.catalogue-item').index(curItem);
                var prevItem  = curBlock.find('.catalogue-item').eq(curIndex - 1);
                var firstItem = curBlock.find('.catalogue-item').eq(curIndex - 2);
                var zeroItem  = curBlock.find('.catalogue-item').eq(curIndex - 3);

                var curHeight = curItem.find('.catalogue-item-text').height();

                if (prevItem.find('.catalogue-item-text').height() > curHeight) {
                    curHeight = prevItem.find('.catalogue-item-text').height();
                }

                if (firstItem.find('.catalogue-item-text').height() > curHeight) {
                    curHeight = firstItem.find('.catalogue-item-text').height();
                }

                if (zeroItem.find('.catalogue-item-text').height() > curHeight) {
                    curHeight = zeroItem.find('.catalogue-item-text').height();
                }

                curItem.find('.catalogue-item-text').height(curHeight);
                prevItem.find('.catalogue-item-text').height(curHeight);
                firstItem.find('.catalogue-item-text').height(curHeight);
                zeroItem.find('.catalogue-item-text').height(curHeight);
            });

            if (curBlock.find('.catalogue-item').length % 4 == 3) {
                var curItem   = curBlock.find('.catalogue-item:last');
                var curIndex  = curBlock.find('.catalogue-item').index(curItem);
                var prevItem  = curBlock.find('.catalogue-item').eq(curIndex - 1);
                var firstItem = curBlock.find('.catalogue-item').eq(curIndex - 2);

                var curHeight = curItem.find('.catalogue-item-text').height();

                if (prevItem.find('.catalogue-item-text').height() > curHeight) {
                    curHeight = prevItem.find('.catalogue-item-text').height();
                }

                if (firstItem.find('.catalogue-item-text').height() > curHeight) {
                    curHeight = firstItem.find('.catalogue-item-text').height();
                }

                curItem.find('.catalogue-item-text').height(curHeight);
                prevItem.find('.catalogue-item-text').height(curHeight);
                firstItem.find('.catalogue-item-text').height(curHeight);
            }

            if (curBlock.find('.catalogue-item').length % 4 == 2) {
                var curItem   = curBlock.find('.catalogue-item:last');
                var curIndex  = curBlock.find('.catalogue-item').index(curItem);
                var prevItem  = curBlock.find('.catalogue-item').eq(curIndex - 1);

                var curHeight = curItem.find('.catalogue-item-text').height();

                if (prevItem.find('.catalogue-item-text').height() > curHeight) {
                    curHeight = prevItem.find('.catalogue-item-text').height();
                }

                curItem.find('.catalogue-item-text').height(curHeight);
                prevItem.find('.catalogue-item-text').height(curHeight);
            }
        });
    });

})(jQuery);