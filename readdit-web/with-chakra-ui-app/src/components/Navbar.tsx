import { Box, Flex, Link } from '@chakra-ui/layout';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';

interface NavbarProps {

};

const Navbar: React.FC<NavbarProps> = ({}) => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation()
    const [{data, fetching}] = useMeQuery({
        pause: isServer() // not to run if we are on the server.
    })
    let body = null

    // data is loading.
    if (fetching) {

    // user is not logged in
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link marginRight={2} color='white' >
                        Login
                    </Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color='white' >
                        Register
                    </Link>
                </NextLink>
            </>
        )

    // user is loggin in.
    } else {
        body = (
            <Flex>
                <Box color='orange' margin={2} >{data.me.username}</Box>
                <Button 
                    onClick={() =>{
                        logout()
                    }}
                    isLoading={logoutFetching} 
                    color='white' 
                    variant="link" 
                >
                    Logout
                </Button>
            </Flex>
        )
    }

    return (
        <Flex background='#0089aa' padding={4} >
            <Box marginLeft={'auto'} >
                {body}
            </Box>
        </Flex>
    )
};

export default Navbar;