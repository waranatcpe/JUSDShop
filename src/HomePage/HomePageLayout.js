import { Layout, Menu, Button, Badge, List, Avatar, InputNumber, Modal } from 'antd';
import { MenuOutlined, ShoppingCartOutlined, CloseCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import React from "react";
import './HomePageLayout.css';
import 'antd/dist/antd.css';
import logo from './images/logo.png';
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import AirPurifierPage from '../ItemPage/Appliances/AirPurifiersPage/index.js';
import LandingPage from '../LandingPage/LandingPage.js'
import Web3 from 'web3'
import Shop from '../abis/Shop.json'

const { SubMenu } = Menu;
const { Header, Content, Footer } = Layout;

function loadItemCount() {
  return +localStorage.getItem("itemCount") || 0;
}

function loadItemInCart() {
  return JSON.parse(localStorage.getItem("itemInCart") || "{}");
}
function loadTotal() {
  return +localStorage.getItem("total") || 0;
}
function storeItemCount(itemCount) {
  localStorage.setItem("itemCount", itemCount);
}

function storeItemInCart(itemInCart) {
  localStorage.setItem("itemInCart", JSON.stringify(itemInCart));
}

function storeTotal(total) {
  localStorage.setItem("total", total);
}

class HomePageLayout extends React.Component {
  itemCount = loadItemCount();
  itemInCart = loadItemInCart();
  total = loadTotal();

  state = { 
    shop_contract: null,
    confirmLoading: false, 
    visible: false, 
    itemCount: this.itemCount, 
    itemInCart: this.itemInCart, 
    total: this.total 
  }

  // Load web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  // load blockchain data
  loadBlockchainData = async () => {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()

    this.setState({ account: accounts[0] })

    // Network ID
    const networkId = await web3.eth.net.getId()
    // Network Data
    const networkData = Shop.networks[networkId]
    // Proceed if network exists
    if (networkData) {
      // Get contract, set state
      const shop_contract = new web3.eth.Contract(Shop.abi, networkData.address)
      this.setState({ shop_contract: shop_contract }, () => {
        console.log("contract ready")
      })
    }
  }

  updateTotal = (itemInCart) => {
    var total = 0
    itemInCart.forEach(item => {
      total += item.price * item.amount
    })
    total = Math.round(total)
    storeTotal(total)
    this.setState({ total: total })
  }

  handleAddItem = (newItemCount, newItemInCart) => {
    this.setState({ itemCount: newItemCount, itemInCart: newItemInCart });
    this.updateTotal(newItemInCart)
  }

  remove = (item) => {
    const itemCount = loadItemCount();
    var itemInCart = loadItemInCart();


    const itemIndex = itemInCart.findIndex(function (e) {
      return e.id === item.id
    })

    if (itemIndex >= 0) {
      var newItemCount = itemCount - item.amount
      itemInCart.splice(itemIndex, 1)
      storeItemCount(newItemCount);
      storeItemInCart(itemInCart);
      this.setState({ itemCount: newItemCount, itemInCart: itemInCart });
      this.updateTotal(itemInCart)
    }


  }

  onChange(value, item) {
    if (value === 0) {
      this.remove(item)
    } else {
      const itemCount = loadItemCount();
      var itemInCart = loadItemInCart();
      const itemIndex = itemInCart.findIndex(function (e) {
        return e.id === item.id
      })
      if (itemIndex >= 0) {
        var newItemCount = itemCount + value - item.amount
        itemInCart[itemIndex]["amount"] = value
        this.updateTotal(itemInCart)
        storeItemCount(newItemCount);
        storeItemInCart(itemInCart);
        this.setState({ itemCount: newItemCount, itemInCart: itemInCart });
      }
    }
  }

  showModal() {
    this.setState({ visible: true })
  }

  handleCancel = () => {
    console.log('Clicked cancel button');
    this.setState({ visible: false })
  };

  handleOk = () => {
    this.setState({ confirmLoading: true });
    setTimeout(() => {
      this.setState({ visible: false })
      this.setState({ confirmLoading: false });
      this.checkout();
    }, 1);
  };

  success() {
    Modal.success({
      content: 'Your purchase is complete, thank you for your order!',
    });
  }

  checkout() {
    var items = []
    this.state.itemInCart.forEach(function (item) {
      console.log(item);
      for (var i = 0; i < item.amount; i++) {
        items.push(item.id)
      }
    })

    // this.emptyCart()
    // this.success()
  }

  emptyCart() {
    const newItemCount = 0;
    const newItemInCart = [];
    storeItemCount(newItemCount);
    storeItemInCart(newItemInCart);
    this.setState({ itemCount: newItemCount, itemInCart: newItemInCart });
    this.updateTotal(newItemInCart)
  }



  render() {
    return (
      <Layout style={{ position: 'absolute', height: '100%', width: "100%" }}>
        <Router>
          <Header className="header" style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
            <Link to="/">
              <img className="logo" src={logo} alt="logo" />
            </Link>
            <Menu theme="dark" mode="horizontal" sticky="top">
              <SubMenu key="Categories" icon={<MenuOutlined />} title="Categories">
                {/* Appliances */}
                <SubMenu key="appliances" title="Appliances">
                  <Menu.Item key="rf">Refrigerators & Freezers</Menu.Item>
                  <Menu.Item key="cem">Coffee & Espresso Makers</Menu.Item>
                  <Menu.Item key="ap">
                    <Link to="/appliances/air-purifiers">Air Purifiers</Link>
                  </Menu.Item>
                </SubMenu>
                {/* Computers, Tablets & Accessories */}
                <SubMenu key="cta" title="Computers, Tablets & Accessories">
                  <Menu.Item key="td">Laptops and Desktops</Menu.Item>
                  <Menu.Item key="tie">Tablets, iPads & eReaders</Menu.Item>
                </SubMenu>
                {/* Cell Phones */}
                <SubMenu key="cellphones" title="Cell Phones">
                  <Menu.Item key="iphones">iPhones</Menu.Item>
                  <Menu.Item key="sp">Samsung Phones</Menu.Item>
                  <Menu.Item key="gp">Google Phones</Menu.Item>
                </SubMenu>
              </SubMenu>

              <SubMenu
                class="shopping-cart"
                icon={<Badge count={this.state.itemCount}><Button ghost><ShoppingCartOutlined />Shopping Cart</Button></Badge>}
                key="2"
                theme="light"
                style={{ float: 'right', color: "white" }}
              >
                <List
                  style={{ color: 'white', width: 420 }}
                  itemLayout="horizontal"
                  dataSource={this.state.itemInCart}
                  renderItem={item => (
                    <List.Item
                      actions={[<CloseCircleOutlined style={{ color: 'grey' }} onClick={() => this.remove(item)} />]}
                    >
                      <List.Item.Meta
                        style={{ "margin-left": 20, }}
                        avatar={<Avatar src={item.picture} />}
                        title={<div style={{ color: 'white' }}>{item.name}</div>}
                        description={<InputNumber value={item.amount} onChange={(value) => this.onChange(value, item)} />}
                      />
                      <div style={{ color: 'white', width: 100, "margin-right": 20, }}>
                        Price: ${Math.round(item.price * item.amount, 5)}
                      </div>
                    </List.Item>
                  )}
                >
                  <List.Item style={{ color: 'white' }}>
                    <div style={{ width: 420, height: 50, "text-align": "right", "margin-right": 20 }}>
                      <DollarCircleOutlined />
                      total: ${Math.round(this.state.total)}
                    </div>
                  </List.Item>
                </List>
                <div style={{ "margin-right": 20, "margin-top": 1, "margin-bottom": 10, float: "right" }}>
                  {
                    this.state.itemCount > 0 ?
                      <>
                        <Button onClick={() => this.showModal()}>Checkout</Button>
                        <Modal
                          title="Confirm Checkout"
                          visible={this.state.visible}
                          onOk={this.handleOk}
                          confirmLoading={this.state.confirmLoading}
                          onCancel={this.handleCancel}
                        >
                          <List
                            style={{ width: 420 }}
                            itemLayout="horizontal"
                            dataSource={this.state.itemInCart}
                            renderItem={item => (
                              <List.Item>
                                <List.Item.Meta
                                  style={{ "margin-left": 20, }}
                                  avatar={<Avatar src={item.picture} />}
                                  title={<div>{item.name}</div>}
                                  description={<div>amount: {item.amount}</div>}
                                />
                                <div style={{ width: 100, "margin-right": 20, }}>
                                  Price: ${Math.round(item.price * item.amount, 5)}
                                </div>
                              </List.Item>
                            )}
                          >
                            <List.Item>
                              <div style={{ width: 420, height: 50, "text-align": "right", "margin-right": 20 }}>
                                <DollarCircleOutlined />
                      total: ${Math.round(this.state.total)}
                              </div>
                            </List.Item>
                          </List>
                        </Modal>
                      </> : <Button disabled>Checkout</Button>
                  }
                </div>

              </SubMenu>
            </Menu>
          </Header>
          <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
            <div>
              <Route exact path="/" component={LandingPage}></Route>
              <Route exact path="/appliances/air-purifiers"><AirPurifierPage onAddItem={this.handleAddItem}></AirPurifierPage></Route></div>
          </Content>
        </Router>
      </Layout >
    )
  }
}

export default HomePageLayout;