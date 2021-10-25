# What is the problem with using [NFTs](https://github.com/colin-1833/wrapped-X-invites) for invites?
If anyone can convert their invite into an NFT and sell it on platforms like Opensea, a few problems arise. 
1. Scammers might trick people into paying way too much for a specific but non-differentiated invite, harming the $X reputation. 
2. Revenue from individual invite sales have no positive impact on the $X community. 
3. UX is annoying. A user would have to mint their NFT, list it, then the buyer would need to know to interact with the NFT contract to "access" their invite.

# What problems arise from using JoinX.sol instead of an [NFT-based solution](https://github.com/colin-1833/wrapped-X-invites)?
The main problem is that anyone who calls the join() function will gain access to trading $X but, in return, must give up their unspent invite so that the join() function works for the next person. I believe this is a problem worth having given the massive improvement to UX.
 
# What are the benefits of allowing anyone to buy their way in to $X's community?
1. No one needs to beg for an invite on discord or elsewhere to join the $X community.
2. The revenue from membership sales are diverted into a treasury which the $X community controls. 
3. The $X community can toggle the join() fee based on demand. When interest is low the fee can be small, or nothing at all, and when interest is high the fee can be raised.

# Who controls the treasury?
This will need to be decided by the $X community. Hopefully we can set up a multi sig that includes myself and several key community members

# Potential treasury use cases (ideas welcome!)
1. Fund future contract deployments that add value to the $X ecosystem
2. Sponsor high value, sought-after potential members by re-imbursing their join() fee.
3. Use accumulated funds to start or contribute to a liquidity pool in uniswap v2/v3 (more research needed)
