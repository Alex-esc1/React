import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";
import Link from "next/link";
import ym from 'react-yandex-metrika';
import {wrapper} from "../../store";
import {getAllCategories} from "../../store/category/categoryAction";
import {
    favoriteProductUpdate, getFavoritesProducts,
    getPhone,
    getProductByName, getProductsPhones, isFavoriteProduct,
    view
} from "../../store/product/productAction";
import {getProductOneSelector} from "../../store/product/productSelector";
import {getCategoriesSelector} from "../../store/category/categorySelector";
import {useAuth} from "../../hooks/useAuth";
import {declOfNum, numToDeliveryType, numToPaymentType, numToUnit} from "../../utils/dict_helper";
import {categoryToLineById} from "../../utils/category_helper";
import {emptyFunction} from "../../utils/all_helper";
import LayoutDesktop from "../../components/layout/LayoutDesktop";
import {ProductSimilarOtherSellers} from "../../components/product_page/ProductSimilarOtherSellers";
import {ProductSlider} from "../../components/product_page/ProductSlider";

import {ModalPrice} from "../../components/modal/ModalPrice";
import {ModalOffer} from "../../components/modal/ModalOffer";
import {ModalMessage} from "../../components/modal/ModalMessage";
import {ModalComplaint} from "../../components/modal/ModalComplaint";
import {ModalDostavka} from "../../components/modal/ModalDostavka";
import {AddProductButton} from "../../components/layout/AddProductButton";
import {userUidSelector} from "../../store/itentity/identitySelector";
import {Banner} from "../../components/Banner";
import {getAllBanners} from "../../store/banner/bannerAction";
import moment from "moment";

const Product = (props) => {
    const product = useSelector(getProductOneSelector)
    const [viewCount, setViewCount] = useState(0);
    const [favorite, setFavorite] = useState(false);

    const [userPhone, setUserPhone] = useState({isSow: false, phone: ''});
    const [workingHours, setWorkingHours] = useState(null);

    const [isShowModalPrice, setIsShowModalPrice] = useState(false);
    const [isShowModalOffer, setIsShowModalOffer] = useState(false);
    const [isShowModalMessage, setIsShowModalMessage] = useState(false);
    const [modalMessageText, setModalMessageText] = useState('');
    const [isShowModalComplaint, setIsShowModalComplaint] = useState(false);
    const [isShowModalDostavka, setIsShowModalDostavka] = useState(false);
    const userUid = useSelector(userUidSelector)
    const dispatch = useDispatch();
    const [phones, setPhones] = useState();

    useAuth(false)
    const router = useRouter()

    const showPhone = (productId) => {
        if (!userPhone.isSow) {
            ym('reachGoal', 'show-tel-item')
            dispatch(getPhone(productId, ({data}) => {
                setUserPhone({
                    isSow: true,
                    phone: data.productPhone
                })
            }, emptyFunction))
        }
    }

    useEffect(() => {
        if (product.items.similarOtherSellers && product.items.similarOtherSellers.length > 0 && userUid) {
            let productsId = product.items.similarOtherSellers.map((p) => p.id);
            dispatch(getProductsPhones(productsId, ({data}) => {
                if (data.productsPhones)
                    setPhones(data.productsPhones)
            }, emptyFunction))
        }
    }, [product.items.similarOtherSellers, userUid])

    useEffect(() => {
        if (product.items && product.items.id > 0 && userUid) {
            dispatch(view(product.items.id, ({data}) => {
                setViewCount(data.count)
            }, emptyFunction))

            dispatch(isFavoriteProduct(product.items.id, ({data}) => {
                setFavorite(data.isFavorite)
            }, emptyFunction))

            dispatch(getProductsPhones([product.items.id], ({data}) => {
                if(data.productsPhones && data.productsPhones[0] && data.productsPhones[0].productPhone)
                    setUserPhone({
                        isSow: true,
                        phone: data.productsPhones[0].productPhone
                    })
            }, emptyFunction))

            updateDefaultWorkingHours(product.items.user.workingHours)
        }
    }, [product.items.id, userUid])

    const updateDefaultWorkingHours = (workingHours) => {
        const workingHoursStart = moment();
        const workingHoursFinish = moment();
        if (workingHours) {
            let time = workingHours.split(';')
            workingHoursStart.set({h: time[0].split(':')[0], m: time[0].split(':')[1]});
            workingHoursFinish.set({h: time[1].split(':')[0], m: time[1].split(':')[1]});
            setWorkingHours({start: workingHoursStart, finish: workingHoursFinish});
        }
    }

    useEffect(() => {
        if (userUid) {
            dispatch(getFavoritesProducts(emptyFunction, emptyFunction))
        }
    }, [userUid, router.query])

    if (router.isFallback || product.loading) {
        return <div>Loading...</div>
    }

    const favoriteUpdate = () => {
        dispatch(favoriteProductUpdate(product.items.id, ({data}) => {
            setFavorite(data.isFavorite)
        }, emptyFunction))
    }

    const favoriteUpdateSimilarOtherSellers = (productId) => {
        dispatch(favoriteProductUpdate(productId, ({data}) => {
            let productUrlName = router.query.productUrlName
            console.log(productUrlName)
            //dispatch(getProductByName(productUrlName, emptyFunction, emptyFunction));
        }, emptyFunction))
    }

    return (
        <LayoutDesktop
            title={`${product.items && product.items.name} купить в Минске ${product.items.isArchive === true ? '[Архив]' : ''}`}
            description={`На нашем маркетплейсе Вы можете приобрести ${product.items && product.items.name} по самой выгодной цене!`} 
            parentProps={props}
            mobileUrl={`/product/${product.items && product.items.urlName}`}>
            <div className="container">
                {product.items && (
                    <ProductBreadcrumbs product={product.items}/>
                )}

                <div className="product" itemScope itemType="https://schema.org/Product">
                    <div className="product__main">
                        <div className="product__about">
                            <h1 className="product__heading"
                                itemProp="name">{product.items && product.items.name} {product.items.isArchive === true ? '[Архив]' : ''}</h1>
                            <div className="product__attr">
                                {/*<div className="product__date">
                                    {formatDateForProduct(new Date(product.items.createDate))}</div>*/}
                                <div className="product__view">{viewCount}</div>
                                <div className="product__favorite">
                                    <button
                                        className={favorite ? "product__favorite-btn added" : "product__favorite-btn"}
                                        data-favorite
                                        data-add-text="Добавить в избранное"
                                        data-remove-text="Удалить из избранного"
                                        onClick={favoriteUpdate}
                                    />
                                </div>
                            </div>

                            {product.items && (
                                <>
                                    <ProductSlider
                                        product={product}
                                        setIsShowModalMessage={setIsShowModalMessage}
                                        setModalMessageText={setModalMessageText}
                                    />

                                    <div className="product__option">
                                        <div className="product__option-item">
                                            <div className="product__option-label">Состояние</div>
                                            <div
                                                className="product__option-value">{product.items.isUsedCondition ? "Б/у" : "Новое"}</div>
                                        </div>
                                        <div className="product__option-item">
                                            <div className="product__option-label">Количество</div>
                                            <div
                                                className="product__option-value">{product.items.quantity} {numToUnit(product.items.units)}</div>
                                        </div>

                                        <div className="product__option-item">
                                            <div className="product__option-label">Гарантия</div>
                                            {product.items.isGuarantee ? (
                                                <div
                                                    className="product__option-value">{product.items.guaranteePeriod} {declOfNum(product.items.guaranteePeriod, ['месяц', 'месяца', 'месяцев'])}</div>
                                            ) : (<div className="product__option-value">Нет</div>)}
                                        </div>

                                        <div className="product__option-item">
                                            <div className="product__option-label">Доставка</div>
                                            <div className="product__option-value">
                                                {product.items.deliveryType == 1 ?
                                                    (
                                                        <a className="pointer" onClick={() => {
                                                            setIsShowModalMessage(true)
                                                            setModalMessageText('Какой тип доставки возможен?')
                                                        }}>Уточнить</a>
                                                    )
                                                    :
                                                    numToDeliveryType(product.items.deliveryType)
                                                }
                                            </div>
                                        </div>
                                        <div className="product__option-item">
                                            <div className="product__option-label">Форма оплаты</div>
                                            <div className="product__option-value">
                                                {product.items.paymentType == 1 ?
                                                    (
                                                        <a className="pointer" onClick={() => {
                                                            setIsShowModalMessage(true)
                                                            setModalMessageText('Какая форма оплаты возможна?')
                                                        }}>Уточнить</a>
                                                    )
                                                    :
                                                    numToPaymentType(product.items.paymentType)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="product__desc" itemProp="description">
                                {product.items && product.items.description && (
                                    <div dangerouslySetInnerHTML={{__html: product.items.description}}/>
                                )}
                            </div>
                            {/*{product.items && product.items.description && (*/}
                            {/*<div className="product__location">*/}
                            {/*    <div className="product__location-label">Местоположение</div>*/}
                            {/*    <a href="#" className="product__location-link">Показать на карте</a>*/}
                            {/*</div>*/}
                            {/*)}*/}
                        </div>

                        {product.items && product.items.similarOtherSellers && product.items.similarOtherSellers.length > 0 && (
                            <div>
                                <div className="heading">Похожие товары других продавцов</div>
                                <div className="category-tile">
                                    {product.items.similarOtherSellers.map((p, index) => (
                                        <ProductSimilarOtherSellers key={p.id} product={p} favoriteDisable={true} phone={phones ? phones.find(m => m.id === p.id)?.productPhone : ''}/>
                                    ))}
                                </div>
                                {/*<button className="product-more">Показать еще товары</button>*/}
                            </div>
                        )}
                    </div>
                    <div className="product__aside">
                        <div className="product__sticky">
                            {product.items.isArchive !== true && (
                                <div className="product__price">
                                    {product.items.isPricePercent ? (
                                        <div className="product__price-cost">-{product.items.pricePercent}% <span
                                            className="product__price-currency">от цены нового товара
                                            <span className="tooltip active">
                                                <span className="tooltip__inner">
                                                    Продавец готов продать этот товар по цене ниже рыночной
                                                </span>
                                            </span>
                                        </span></div>
                                    ) : (
                                        <>
                                            {(product.items.priceOld && product.items.priceOld > 0) ? (
                                                <div className="product__price-old-cost">{product.items.priceOld} <span
                                                    className="product__price-old-currency"> BYN</span>
                                                </div>
                                            ): ""}
                                            <div className="product__price-cost" itemProp="price">{product.items.price}
                                                <span
                                                    className="product__price-currency"
                                                    itemProp="priceCurrency"> BYN</span>
                                                {product.items.isAllPrice ? (
                                                    <span className="product__all-price">за всё</span>
                                                ) : (
                                                    <span className="product__all-price">за единицу</span>
                                                    
                                                )}
                                                <p className="product__seller-label">Обязательно скажите продавцу:</p>
                                                <p className="footer__title">Звоню с MINUS50!</p>
                                            </div>
                                        </>
                                    )}
                                    {product.items.user && product.items.user.isDiscountPossible &&
                                        <div className="product__price-more">
                                            Купить ещё дешевле
                                            <span className="tooltip"><span className="tooltip__inner">
                                                    Продавец готов сделать скидку, если при обращении, вы сообщите ему
                                                    о том, что вы с портала <u>minus50.by</u>
                                                </span></span>
                                        </div>
                                    }
                                </div>
                            )}
                            {product.items && product.items.isRent && (
                                <div className="product__rent">
                                    <div className="product__rent-label">Возможна аренда</div>
                                    <div className="product__rent-more">
                                        <a href={`https://files.minus50.by/docs/${product.items.rentContract ? product.items.rentContract.fileName : 'dogovor-arenda-imuchestva.doc'}`}
                                           className="product__rent-link" target="_blank">Пример договора аренды</a>
                                    </div>
                                </div>
                            )}

                            <div className="product__action">
                                <div className="product__action-item">
                                    <button onClick={() => {
                                        setIsShowModalOffer(true)
                                    }} className="product__btn product__btn_price">Предложить свою цену
                                    </button>
                                </div>
                                <div className="product__action-item">
                                    <button onClick={() => showPhone(product.items.id)}
                                            className={userPhone.isSow ? "product__btn product__btn_phone active" : "product__btn product__btn_phone"}
                                    >
                                        {userPhone.isSow ? (userPhone.phone !== "" ? `+${userPhone.phone}` : "отсутствует") : "Показать телефон"}
                                    </button>
                                </div>
                                <div className="product__action-item">
                                    <button onClick={() => {
                                        setIsShowModalMessage(true)
                                        setModalMessageText('')
                                    }} className="product__btn product__btn_message">Написать продавцу
                                    </button>
                                </div>
                                {/*<div className="product__action-item">
                                    <button onClick={() => {
                                        setIsShowModalDostavka(true)
                                    }} id="dostavka" className="product__btn product__btn_message">Заказать доставку
                                    </button>
                                </div>*/}
                            </div>
                            <div className="product__similar">
                                <div className="product__similar-head"><a onClick={() => {
                                    setIsShowModalPrice(true)
                                }} className="product__price-link pointer">Узнать о
                                    снижении цены</a></div>
                            </div>
                            <div className="product__seller">
                                <div className="product__seller-label">Продавец</div>
                                {product.items && product.items.user && (
                                    <>
                                        <div className="product__seller-value">{product.items.user.fullName}</div>
                                        {product.items.user.cityName && product.items.user.cityName !== "" && (
                                            <div className="product__seller-value">{product.items.user.cityName}</div>
                                        )}
                                        {product.items.user.address && product.items.user.address !== "" && (
                                            <div className="product__seller-value">{product.items.user.address}</div>
                                        )}
                                        {workingHours && (
                                            <div className="product__seller-value">Время работы: {workingHours?.start?.format('HH:mm')} - {workingHours?.finish?.format('HH:mm')}</div>
                                        )}
                                    </>
                                )}
                            </div>
                            {product.items && product.items.user && product.items.user.userType === 1 &&
                            <div className="product__similar">
                                <div className="product__similar-head">
                                    <Link href={'/company/[userUrlName]'} as={`/company/${product.items.userId}`}>
                                        <a className="product__similar-link" target="_blank">Все товары продавца</a>
                                    </Link>
                                </div>
                            </div>
                            }
                            {/*product.items && product.items.similarList && (
                                <ProductSimilar products={product.items.similarList}
                                                count={product.items.similarAllCount}/>)*/}

                            <div className="product__complaint">
                                <button onClick={() => {
                                    setIsShowModalComplaint(true)
                                }} className="product__complaint-btn">Пожаловаться
                                    на товар
                                </button>
                            </div>
                        </div>

                    </div>
                    <div className="product__aside">
                        <div className="product__sticky">
                            <div className="widget">
                                <Banner itemKey={'DesktopProductRight1'}/>
                            </div>
                            <div className="widget">
                                <Banner itemKey={'DesktopProductRight2'}/>
                            </div>
                            <div className="widget">
                                <Banner itemKey={'DesktopProductRight3'}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalPrice productId={product.items.id} show={isShowModalPrice} setIsShowModal={setIsShowModalPrice}/>
            <ModalOffer productId={product.items.id} show={isShowModalOffer} setIsShowModal={setIsShowModalOffer}/>
            <ModalMessage productId={product.items.id}
                          show={isShowModalMessage}
                          setIsShowModal={setIsShowModalMessage}
                          modalMessageText={modalMessageText}
            />
            <ModalComplaint productId={product.items.id} show={isShowModalComplaint}
                            setIsShowModal={setIsShowModalComplaint}/>
            <ModalDostavka productId={product.items.id} show={isShowModalDostavka}
                            setIsShowModal={setIsShowModalDostavka}/>
            <AddProductButton/>
        </LayoutDesktop>
    );
}

const ProductBreadcrumbs = (props) => {
    const category = useSelector(getCategoriesSelector);
    const {product} = props
    return (
        <div className="breadcrumbs">
            <Link href={'/'}>
                <a className="breadcrumbs__link">Главная</a>
            </Link>
            <span className="breadcrumbs__sep"> - </span>
            {product && product.category && product.category && categoryToLineById(category.categories, product.category.id, true).map((cat) => (
                <>
                    <Link href="/category/[categoryUrlName]"
                          as={`/category/${cat.urlName}`}>
                        <a className="breadcrumbs__link">{cat.name}</a>
                    </Link>
                    <span className="breadcrumbs__sep"> - </span>
                </>
            ))}
            <span className="breadcrumbs__current">{product && product.name}</span>
        </div>
    )
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async ({params}) => {
    await store.dispatch(getAllCategories());
    await store.dispatch(getAllBanners(true, emptyFunction, emptyFunction));
    await store.dispatch(getProductByName(params.productUrlName, emptyFunction, emptyFunction));
})

//
// export async function getStaticPaths() {
//     //TODO: передалеать на получение дерева категорий у каких имеется продукт
//     //let url = `${process.env.NEXT_PUBLIC_API_URL}/products/get-all-urlnames`
//     //const posts = await api.get(url)
//     //const paths = posts && posts.data ? posts.data.map((post) => ({
//     //    params: {categoryUrlName: post},
//     //})) : []
//     let paths = []
//     return {paths, fallback: true}
// }
//
// export const getStaticProps = wrapper.getStaticProps(async ({store, req, params}) => {
//     let _status = requestStatusTypes.WAIT
//     await store.dispatch(getProductByName(params.productUrlName,
//         ({status}) => {
//             _status = status
//         }, ({status}) => {
//             _status = status
//         }));
//     await store.dispatch(getAllCategories());
//     //await store.dispatch(getExchangeRates);
//
//     return {
//         revalidate: 30, // In seconds
//         notFound: (_status !== requestStatusTypes.OK),
//     }
// })


export default (Product);
