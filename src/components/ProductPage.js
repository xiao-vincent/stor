import React, { Component, Fragment } from "react";
import styled from "styled-components";
import theme from "../theme";
import RadioInput from "./GeneralUI/RadioInput";
import WarningText from "./WarningText";
import ReactImageMagnify from "react-image-magnify";
import { Form, Field } from "react-final-form";
import { NavLink } from "react-router-dom";
import Washer_svg from "../images/svgs/washer.svg";
import Icon from "./Icon";
import { ICONS } from "./constants";

const RadioInputs = props => {
  const { name, options, customOnChange, error } = props;
  return (
    <Inputs_Styled error={error}>
      {options.map((option, i) => (
        <Field key={i} name={name} component="input">
          {({ input, meta }) => {
            return (
              <Fragment>
                <input
                  {...input}
                  type="radio"
                  onChange={value => {
                    customOnChange(option.value);
                    return input.onChange(value);
                  }}
                  id={i}
                  value={option.value}
                />
                <label htmlFor={i}>{option.displayValue}</label>
                {/* {meta.submitFailed && <span>{meta.error}</span>} */}
              </Fragment>
            );
          }}
        </Field>
      ))}
    </Inputs_Styled>
  );
};

class ProductPage extends Component {
  constructor(props) {
    super(props);
    const { products, match, productLimit, sizeOptions } = props;

    this.sameProducts = products[match.params.category].filter(
      product => match.params.productName === product.name && match.params.brand === product.brand
    );

    Object.assign(this, { productLimit, sizeOptions });
    this.purchasedNotification = "Added to cart!";
    this.timeoutIdStack = [];
    this.state = {
      issueWarning: "",
      quantityLimitReached: false,
      product: this.getProduct(match.params.color),
      productInCart: null,
      selectedSize: undefined
    };
  }

  getProduct(color) {
    return this.sameProducts.filter(product => color === product.color)[0];
  }

  checkProductInCart() {
    const productInCart = this.props.cart.find(cartProduct => {
      return cartProduct.id === this.state.product.id && cartProduct.size === this.state.product.size;
    });

    if (productInCart) {
      this.setState(
        {
          productInCart: productInCart
        },
        function() {
          this.checkQuantityLimit();
        }
      );
      return true;
    } else {
      this.clearQuantityLimit();
      return false;
    }
  }

  clearQuantityLimit() {
    //if quantity is not reached, reset state
    this.setState({
      quantityLimitReached: false,
      issueWarning: ""
    });
  }

  checkQuantityLimit() {
    const { productInCart, quantityLimitReached } = this.state;
    if (productInCart.quantity === this.productLimit) {
      this.setState({
        quantityLimitReached: true,
        issueWarning: this.purchasedNotification + "\n (Limit of 10 for this item and size)"
      });
    } else {
      this.clearQuantityLimit();
    }
  }

  componentWillMount() {
    window.scrollTo(0, 0);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.color !== nextProps.match.params.color) {
      this.setState(
        {
          product: { ...this.getProduct(nextProps.match.params.color), size: this.state.selectedSize }
        },
        function() {
          this.checkProductInCart();
          this.clearNotificationStack();
        }
      );
    }
  }

  componentDidUpdate() {}

  clearTimeoutOnStack(stackArray) {
    stackArray.map(id => clearTimeout(id));
  }

  clearNotificationStack() {
    this.clearTimeoutOnStack(this.timeoutIdStack);
    this.timeoutIdStack = [];
  }

  updateProduct = eventValue => {
    const selectedProduct = { ...this.state.product, size: eventValue };
    this.clearNotificationStack(); 
    this.setState(
      {
        product: selectedProduct,
        selectedSize: eventValue,
        issueWarning: eventValue
      },
      function() {
        this.checkProductInCart();
      }
    );
  };

  onSubmit = values => {
    if (!this.state.product.size) {
      console.log(this.state.product);
      this.setState({
        issueWarning: "Please select a size*"
      });
      return;
    }
    this.props.addToCart(this.state.product);
    // this.notificationStack.push(this.purchasedNotification);

    this.timeoutIdStack.push(setTimeout(() => {
      this.timeoutIdStack.pop();
      this.forceUpdate();
    }, 2000));
    this.checkProductInCart();
  };

  render() {
    const { quantityLimitReached, issueWarning, product, selectedSize, productInCart } = this.state;
    const colors = this.sameProducts.map(product => (
      <StyledColor
        key={product.color}
        to={this.props.location.pathname.replace(this.props.match.params.color, product.color)}
        replace
      >
        <Color colorCode={product.colorCode} />
      </StyledColor>
    ));

    return (
      <Styled>
        <img className="image" src={product.img} alt={product.img} />
        <div className="product-info">
          <div>
            <h2 className="brand">{product.brand}</h2>
            <h2 className="name">{product.name}</h2>
          </div>
          <h3 className="price">${product.price}</h3>
          <div>
            <h3 className="color-size-text">{product.color}</h3>
            <StyledColorsContainer>{colors}</StyledColorsContainer>
          </div>
          <Form
            onSubmit={this.onSubmit}
            render={({ handleSubmit, reset, submitting, pristine, values }) => {
              return <form onSubmit={handleSubmit}>
                  <WarningText className="color-size-text" warn={!selectedSize && issueWarning} showUserInput={selectedSize} defaultText="Size">
                    {selectedSize || issueWarning}
                  </WarningText>
                  <RadioInputs name="size" options={this.sizeOptions} customOnChange={this.updateProduct} error={!selectedSize && issueWarning} />
                  <div>
                    <WarningText success>
                      {(quantityLimitReached && issueWarning) || this.timeoutIdStack.length > 0 && this.purchasedNotification}
                    </WarningText>
                    <button disabled={quantityLimitReached}>Add to Cart</button>
                  </div>
                </form>;
            }}
          />
          <div className="details-container">
            <div className="detail">
              <span>
                <Icon icon={ICONS.WASHING_MACHINE} />
              </span>
              <p>Machine washable</p>
            </div>
            <div className="detail">
              <span>
                <Icon icon={ICONS.THREAD_WHEEL} size="19" />
              </span>
              <p>Made in Omaha, NE</p>
            </div>
          </div>
          <div className="description">
            <h3 className="title">Description</h3>
            <p className="content">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam ad dolor iure similique magnam, totam
              accusantium illo natus error. Fugiat facere unde harum dolor dicta aliquid quibusdam.
            </p>
          </div>
        </div>
      </Styled>
    );
  }
}

export default ProductPage;

const StyledColorsContainer = styled.div``;

const activeClassName = "nav-item-active";
const StyledColor = styled(NavLink).attrs({
  activeClassName
})`
  display: inline-block;
  margin-right: 1rem;
  padding: 0.4rem;
  border: 1.3px solid transparent;
  border-radius: 50%;
  transition: all 0.3s ease-out;
  margin-bottom: 2rem;

  &.${activeClassName}, &:hover,
  &:active {
    color: ${props => `${props.theme.primary} !important`};
    border-color: ${theme.grey_5};
  }
`;

const Color = styled.div`
  background-color: ${props => props.colorCode};
  display: inline-block;
  border: ${props => props.colorCode === "#fff" && `1px solid #dfe0e1`};
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  justify-content: center;
  vertical-align: middle;
`;

const Styled = styled.div`
  grid-column: full;

  display: grid;
  grid-template-columns: 1fr minmax(33rem, 55rem) 5rem 30rem 1fr;

  .image {
    width: 100%;
    grid-column: 2/3;
  }

  .product-info {
    grid-column: 4/5;

    display: grid;

    .name {
      font-size: 3rem;
    }
    .brand {
      color: ${theme.grey_4};
      font-size: 2.1rem;
    }
    .price {
      font-size: 2.5rem;
      font-weight: 500;
      margin: 3rem 0 5rem;
    }
    .color-size-text {
      font-size: 1.75rem;
      color: ${theme.grey_4};
      font-weight: 500;
      margin-bottom: 0.9rem;
    }
    .details-container {
      margin: 5rem 0 2rem;
      font-size: 1.5rem;
      line-height: 1.8;

      .detail {
        display: grid;
        grid-template-columns: 2.5rem max-content;

        p {
          color: ${theme.grey_6};
        }

        svg {
          fill: ${theme.grey_6};
        }

        .thread-wheel {
          margin-left: 1px !important;
        }
      }
    }
    .description {
      line-height: 1.5;
      .title {
        font-size: 1.5rem;
        font-weight: 500;
        color: ${theme.grey_4};
      }
      .content {
        font-size: 1.2rem;
        color: ${theme.grey_6};
      }
    }
  }
`;

const Inputs_Styled = styled.div`
  display: flex;
  justify-content: space-between;
  width: 20rem;
  margin-top: -0.5rem;
  padding: 0.3rem 0.4rem;
  border: ${props => props.error && `1px solid #F15C5C`};
  border-radius: 3px;
  margin-bottom: 2rem;

  input {
    display: none;

    & + label:hover,
    &:checked + label {
      border: 1px solid ${theme.grey_4};
      border-radius: 2px;
      color: ${theme.grey_4};
      transition: all 0.3s ease-out;
    }
  }
  label {
    display: inline-block;
    cursor: pointer;
    font-size: 1.8rem;
    font-weight: 600;
    border: 1px solid transparent;
    padding: 0.4rem 0.7rem;
    user-select: none;
  }
`;